use std::path::Path;

use image_hasher::{HashAlg, HasherConfig};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};

use crate::old::image::Image;

pub struct Scanner;

impl Scanner {
  fn compute_hash(path: &String) -> Option<Vec<u8>> {
    let img = image::open(path).ok()?;

    let hasher = HasherConfig::new().hash_alg(HashAlg::Mean).to_hasher();

    let hash = hasher.hash_image(&img);

    Some(hash.as_bytes().to_vec())
  }

  pub fn detect_duplicates(path: &str, threshold: u32) -> Result<Vec<Vec<Image>>, String> {
    // --- STEP 1: FIND FILES ---
    let image_entries = Image::from_dir(&path)?;

    // --- STEP 2: PARALLEL HASHING ---
    let hashed_images: Vec<(&Image, Vec<u8>)> = image_entries
      .par_iter()
      .filter_map(|image| {
        let hash = Self::compute_hash(&image.path)?;
        Some((image, hash))
      })
      .collect();

    // --- STEP 3: GROUPING ---
    let mut groups: Vec<Vec<Image>> = Vec::new();
    let mut visited = vec![false; hashed_images.len()];

    for i in 0..hashed_images.len() {
      if visited[i] {
        continue;
      }

      // Start a new group with the current image
      let mut current_group = vec![hashed_images[i].0.clone()];

      let hash_a = &hashed_images[i].1;

      for j in (i + 1)..hashed_images.len() {
        if visited[j] {
          continue;
        }

        let hash_b = &hashed_images[j].1;

        // Calculate Hamming Distance (Bitwise XOR)
        // Example: 1011 ^ 1001 = 0010 (2 bits different)
        let dist = hash_a
          .iter()
          .zip(hash_b)
          .map(|(a, b)| (a ^ b).count_ones())
          .sum::<u32>();

        if dist <= threshold {
          current_group.push(hashed_images[j].0.clone());
          visited[j] = true;
        }
      }
      groups.push(current_group);
    }

    // Filter out groups with less than 2 images
    // Sort each group by size (Largest = Best Quality usually)
    // Place the best image first
    let sorted_groups: Vec<Vec<Image>> = groups
      .into_iter()
      .filter_map(|mut group| {
        if group.len() < 2 {
          None
        } else {
          group.sort_by(|a, b| b.size_bytes.cmp(&a.size_bytes));

          Some(group)
        }
      })
      .collect();

    Ok(sorted_groups)
  }
}

pub struct FileOps;

impl FileOps {
  pub fn soft_delete(image_paths: &[&Path]) -> Result<(), String> {
    let paths_str: Vec<String> = image_paths
      .iter()
      .map(|path| path.to_string_lossy().to_string())
      .collect();
    trash::delete_all(paths_str).map_err(|e| e.to_string())?;
    Ok(())
  }
}

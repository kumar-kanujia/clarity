#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PipelineSignal {
  ImageAdded,
  ImageHashed,
  ImageDeleted,
}

import { Upload, Folder, ImageIcon, Plus, CheckCircle2 } from "lucide-react"
import { useState } from "react"

import { useImport, useSelectFiles } from "@/features/images/hooks"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export const ImportDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"images" | "folder">("images")
  const [files, setFiles] = useState<string[]>([])

  const { selectFiles } = useSelectFiles()

  const {
    mutate: importImages,
    isPending,
    data,
    isSuccess,
    reset
  } = useImport()

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFiles([])
      reset()
    }
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <Plus />
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-2xl overflow-hidden select-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Import Assets
          </DialogTitle>
        </DialogHeader>

        {!isSuccess && files.length === 0 && (
          <Tabs
            className="mt-4 "
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="images" className="flex gap-2 items-center">
                <ImageIcon className="h-4 w-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="folder" className="flex gap-2 items-center">
                <Folder className="h-4 w-4" />
                Folder
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="images"
              className="mt-4"
              onClick={() => {
                selectFiles("images").then(setFiles)
              }}
            >
              <Card className="border-dashed border-2 hover:bg-muted/40 transition">
                <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
                  <Upload className="size-12" />
                  <p className="text-sm text-muted-foreground text-center">
                    Select images
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="folder"
              className="mt-4"
              onClick={() => {
                selectFiles("folders").then(setFiles)
              }}
            >
              <Card className="border-dashed border-2 hover:bg-muted/40 transition">
                <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
                  <Folder className="size-12" />
                  <p className="text-sm text-muted-foreground text-center">
                    Select Folders
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!isSuccess && files.length > 0 && (
          <ScrollArea className={"h-50"}>
            {files.map((file) => (
              <div
                key={file}
                className="flex items-center gap-2 p-4 border-b border-dashed border-muted/30"
              >
                {activeTab === "images" && (
                  <Badge variant="outline" className="text-xs">
                    {file.split(".").pop() || "file"}
                  </Badge>
                )}
                {activeTab === "folder" && (
                  <Badge variant="outline" className="text-xs">
                    <Folder />
                  </Badge>
                )}
                <p className="text-sm text-muted-foreground truncate">
                  {file.split("/").pop()}
                </p>
              </div>
            ))}
          </ScrollArea>
        )}

        {isSuccess && data && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Import Completed</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <StatusCard label="Total Scanned" value={data.totalScanned} />
              <StatusCard label="Imported" value={data.totalImported} />
              <StatusCard label="Failed" value={data.failed} />
              <StatusCard
                label="Skipped (Already Exists)"
                value={data.skipped}
              />
            </div>
          </div>
        )}

        {!isSuccess && files.length > 0 && (
          <DialogFooter className="mt-6">
            <Button variant={"secondary"} onClick={() => setFiles([])}>
              Clear
            </Button>
            <Button disabled={isPending} onClick={() => importImages(files)}>
              Import {files.length} {activeTab}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

const StatusCard = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className="rounded-2xl border p-4 bg-muted/30">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  )
}

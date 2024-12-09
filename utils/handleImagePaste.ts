export function handleImagePaste(e: React.ClipboardEvent, callback: (file: File) => void) {
  const items = e.clipboardData?.items
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          callback(file)
        }
      }
    }
  }
}


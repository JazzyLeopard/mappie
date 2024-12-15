import * as React from 'react'
import { HexColorPicker } from 'react-colorful'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface ColorPickerProps {
  onColorChange: (color: string) => void
}

export function ColorPicker({ onColorChange }: ColorPickerProps) {
  const [color, setColor] = React.useState('#000000')

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onColorChange(newColor)
  }

  return (
    <div className="grid gap-4">
      <HexColorPicker color={color} onChange={handleColorChange} />
      <div className="grid grid-cols-3 items-center gap-2">
        <Label htmlFor="color">Hex</Label>
        <Input
          id="color"
          value={color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="col-span-2"
        />
      </div>
    </div>
  )
}


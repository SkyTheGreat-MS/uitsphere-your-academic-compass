"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cropImageToFile } from "@/lib/cropImage";

export function AvatarCropper({
  imageSrc,
  onCancel,
  onSave,
  saving,
}: {
  imageSrc: string;
  onCancel: () => void;
  onSave: (file: File) => void;
  saving?: boolean;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => setCroppedAreaPixels(croppedAreaPixels),
    [],
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const file = await cropImageToFile(imageSrc, croppedAreaPixels);
      onSave(file);
    } catch {
      onCancel();
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
          <DialogDescription>
            Drag to position and use the slider to zoom. Your picture will be cropped to a square.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-border bg-muted/40 sm:h-80">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid
            restrictPosition
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            classes={{ containerClassName: "rounded-2xl" }}
            style={{ containerStyle: { width: "100%", height: "100%" } }}
          />
        </div>

        <div className="flex items-center gap-3 px-1">
          <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
          <Slider
            min={1}
            max={3}
            step={0.01}
            value={[zoom]}
            onValueChange={(value) => setZoom(value[0] ?? 1)}
            aria-label="Zoom"
            className="flex-1"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => void handleSave()}
            disabled={saving || !croppedAreaPixels}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

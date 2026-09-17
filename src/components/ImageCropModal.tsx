"use client";

import React, { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { ZoomIn, ZoomOut, RotateCw, Check, X, Crop as CropIcon } from "lucide-react";

export interface AspectOption {
  label: string;
  value: number;
}

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  title?: string;
  defaultAspect?: number;
  aspectOptions?: AspectOption[];
  onCropSave: (croppedFile: File, croppedPreviewUrl: string) => void;
  onCancel: () => void;
}

// Canvas Cropper Helper
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<{ file: File; url: string }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const rotRad = (rotation * Math.PI) / 180;

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    throw new Error("No 2d context for crop");
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const file = new File([blob], `banner_cropped_${Date.now()}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
      const url = URL.createObjectURL(blob);
      resolve({ file, url });
    }, "image/jpeg", 0.92);
  });
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  title = "Crop Image",
  defaultAspect = 16 / 5,
  aspectOptions = [],
  onCropSave,
  onCancel,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(defaultAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const { file, url } = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      onCropSave(file, url);
    } catch (e) {
      console.error("Error cropping image:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-100 text-[#9e0d0d]">
              <CropIcon size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{title}</h3>
              <p className="text-xs text-gray-500">Drag & zoom to adjust your banner frame</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-[380px] bg-slate-900 overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect === 0 ? undefined : aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={true}
          />
        </div>

        {/* Controls Section */}
        <div className="p-5 bg-gray-50/90 border-t space-y-4">
          {/* Aspect Ratio Options */}
          {aspectOptions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-600 mr-1">Aspect Ratio:</span>
              {aspectOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setAspect(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    aspect === opt.value
                      ? "bg-[#9e0d0d] text-white border-[#9e0d0d] shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Zoom and Rotate Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-600 w-12">Zoom:</span>
              <button
                type="button"
                onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                className="p-1.5 text-gray-600 hover:text-gray-900 rounded-md bg-white border border-gray-200"
              >
                <ZoomOut size={14} />
              </button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#9e0d0d]"
              />
              <button
                type="button"
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                className="p-1.5 text-gray-600 hover:text-gray-900 rounded-md bg-white border border-gray-200"
              >
                <ZoomIn size={14} />
              </button>
              <span className="text-xs font-mono text-gray-500 w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Rotate Button */}
            <div className="flex items-center justify-start md:justify-end gap-3">
              <span className="text-xs font-semibold text-gray-600">Rotate:</span>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                <RotateCw size={14} />
                <span>Rotate 90°</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-white">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#9e0d0d] text-sm font-semibold text-white hover:bg-[#7c0a0a] shadow-md transition disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Cropping...</span>
            ) : (
              <>
                <Check size={16} />
                <span>Crop & Use Image</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

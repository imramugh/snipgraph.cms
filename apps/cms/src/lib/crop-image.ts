import type { Area } from "react-easy-crop";

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected image could not be previewed."));
    image.src = url;
  });
}

function rotatedSize(width: number, height: number, degrees: number) {
  const radians = degrees * Math.PI / 180;
  return {
    width: Math.abs(Math.cos(radians) * width) + Math.abs(Math.sin(radians) * height),
    height: Math.abs(Math.sin(radians) * width) + Math.abs(Math.cos(radians) * height),
  };
}

export async function cropImage(file: File, crop: Area, rotation: number) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const bounds = rotatedSize(image.naturalWidth, image.naturalHeight, rotation);
    const source = document.createElement("canvas");
    source.width = Math.ceil(bounds.width);
    source.height = Math.ceil(bounds.height);
    const sourceContext = source.getContext("2d");
    if (!sourceContext) throw new Error("Image editing is not available in this browser.");
    sourceContext.translate(source.width / 2, source.height / 2);
    sourceContext.rotate(rotation * Math.PI / 180);
    sourceContext.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
    sourceContext.drawImage(image, 0, 0);

    const output = document.createElement("canvas");
    output.width = Math.max(1, Math.round(crop.width));
    output.height = Math.max(1, Math.round(crop.height));
    const outputContext = output.getContext("2d");
    if (!outputContext) throw new Error("Image editing is not available in this browser.");
    outputContext.drawImage(source, -Math.round(crop.x), -Math.round(crop.y));

    const blob = await new Promise<Blob>((resolve, reject) => output.toBlob((result) => result ? resolve(result) : reject(new Error("The cropped image could not be created.")), "image/jpeg", 0.92));
    const stem = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]+/g, "-") || "image";
    return new File([blob], `${stem}-cropped.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

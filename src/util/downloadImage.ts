/*!
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export function downloadImage(
  url: string,
  type = 'image/jpeg',
  quality: any = 0.85
): Promise<{
  data: string;
  height: number;
  width: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      canvas.height = img.naturalHeight;
      canvas.width = img.naturalWidth;

      ctx.drawImage(img, 0, 0);

      const data = canvas.toDataURL(type, quality);

      resolve({
        data,
        height: img.naturalHeight,
        width: img.naturalWidth,
      });
    };
  });
}

import argparse
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

from google import genai
from google.genai.types import GenerateImagesResponse


ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT_DIR = ROOT_DIR / "images"


def load_env_file(env_path: Path) -> None:
    """Populate os.environ with values from a simple KEY=VALUE .env file."""
    if not env_path.exists():
        return

    for line in env_path.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith('#') or '=' not in stripped:
            continue
        key, value = stripped.split('=', 1)
        os.environ.setdefault(key, value)


load_env_file(ROOT_DIR / ".env")


api_key = os.environ.get('GEMINI_API_KEY')
if not api_key:
    raise RuntimeError(
        "Missing GEMINI_API_KEY. Add it to your environment or the project .env file."
    )


client = genai.Client(api_key=api_key)


def build_output_path(prompt: str, explicit_output: Optional[str]) -> Path:
    """Return a path inside the images directory, auto-naming when needed."""
    if explicit_output:
        candidate = Path(explicit_output)
        output_path = candidate if candidate.is_absolute() else DEFAULT_OUTPUT_DIR / candidate
    else:
        slug = re.sub(r"[^a-z0-9]+", "-", prompt.lower()).strip("-")
        slug = slug[:50] or "generated-image"
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        output_path = DEFAULT_OUTPUT_DIR / f"{timestamp}-{slug}.png"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    return output_path

def save_image_from_response(response: GenerateImagesResponse, output_path: str) -> bool:
    """Extract the first generated image from the response and save it."""
    if not response.generated_images:
        return False

    image = response.generated_images[0].image
    if not image or not image.image_bytes:
        return False

    with open(output_path, "wb") as file_handle:
        file_handle.write(image.image_bytes)
    return True


def generate_image(prompt: str, output_path: Path) -> None:
    response = client.models.generate_images(
        model="imagen-3.0-generate-002",
        prompt=prompt,
    )
    if save_image_from_response(response, str(output_path)):
        print(f"Image saved as {output_path}")
    else:
        raise RuntimeError("No image data returned by the model")


def main(argv: Optional[list[str]] = None) -> None:
    parser = argparse.ArgumentParser(description="Generate an image using Gemini from a text prompt.")
    parser.add_argument("prompt", help="Text prompt to send to the model")
    parser.add_argument(
        "--output",
        default=None,
        help="File name or relative path under the images directory (default: timestamp+slug).",
    )
    parser.add_argument(
        "--transparent",
        action="store_true",
        help="Append guidance for a transparent background to the prompt.",
    )
    args = parser.parse_args(argv)

    prompt = args.prompt.strip()
    if args.transparent and "transparent background" not in prompt.lower():
        prompt = f"{prompt}, with a transparent background"

    output_path = build_output_path(args.prompt, args.output)
    generate_image(prompt, output_path)


if __name__ == "__main__":
    main()

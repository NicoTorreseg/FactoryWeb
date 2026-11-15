"""Automated Mobile & Desktop Screenshot Generator using Playwright."""
from __future__ import annotations

import argparse
from pathlib import Path


def capture_demo_screenshots(
    slug: str,
    base_url: str = "http://localhost:5173",
    output_dir: Path | None = None,
) -> tuple[Path, Path]:
    """
    Opens `/d/{slug}?capture=1` in headless Chromium using Playwright
    and saves both a Mobile (iPhone 390x844) and Desktop (1280x800) screenshot
    ready to embed in the cold outreach email.
    """
    from playwright.sync_api import sync_playwright

    project_root = Path(__file__).resolve().parent.parent.parent
    target_dir = output_dir or (project_root / "outreach_output" / slug)
    target_dir.mkdir(parents=True, exist_ok=True)

    url = f"{base_url.rstrip('/')}/d/{slug}?capture=1"
    mobile_path = target_dir / "mobile_capture.png"
    desktop_path = target_dir / "desktop_capture.png"
    mobile_dark_path = target_dir / "mobile_dark_capture.png"
    desktop_dark_path = target_dir / "desktop_dark_capture.png"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Mobile Capture (iPhone 14 Pro viewport - Light)
        mobile_ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
        )
        mobile_page = mobile_ctx.new_page()
        mobile_page.goto(f"{url}&mode=light", wait_until="networkidle", timeout=30000)
        mobile_page.screenshot(path=str(mobile_path), full_page=False)

        # 2. Mobile Capture (Dark Mode)
        mobile_page.goto(f"{url}&mode=dark", wait_until="networkidle", timeout=30000)
        mobile_page.screenshot(path=str(mobile_dark_path), full_page=False)
        mobile_ctx.close()

        # 3. Desktop Capture (Light)
        desktop_ctx = browser.new_context(
            viewport={"width": 1280, "height": 820},
            device_scale_factor=2,
        )
        desktop_page = desktop_ctx.new_page()
        desktop_page.goto(f"{url}&mode=light", wait_until="networkidle", timeout=30000)
        desktop_page.screenshot(path=str(desktop_path), full_page=False)

        # 4. Desktop Capture (Dark)
        desktop_page.goto(f"{url}&mode=dark", wait_until="networkidle", timeout=30000)
        desktop_page.screenshot(path=str(desktop_dark_path), full_page=False)
        desktop_ctx.close()

        browser.close()

    print(f"[OK] Saved mobile screenshot (light) -> {mobile_path}")
    print(f"[OK] Saved mobile screenshot (dark)  -> {mobile_dark_path}")
    print(f"[OK] Saved desktop screenshot (light) -> {desktop_path}")
    print(f"[OK] Saved desktop screenshot (dark)  -> {desktop_dark_path}")
    return mobile_path, desktop_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Capture DemoFactory screenshots")
    parser.add_argument("--seller", default="viothaniarg")
    parser.add_argument("--url", default="http://localhost:5173")
    args = parser.parse_args()
    capture_demo_screenshots(slug=args.seller, base_url=args.url)


if __name__ == "__main__":
    main()

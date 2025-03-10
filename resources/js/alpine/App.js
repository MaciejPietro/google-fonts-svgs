import Alpine from "alpinejs";
import FontLoader from "../fontLoader.js";
import { load } from "opentype.js";
import makerjs from "makerjs";
import JSZip from "jszip";
import { saveAs } from "file-saver";

Alpine.data("app", () => ({
  fontsList: [],
  selectedFont: null,
  selectedVariant: null,
  regularAsAlt: true,
  selectedFonts: {},
  allFontsSelected: false,
  text: "Sample",
  size: 100,
  union: true,
  filled: true,
  kerning: true,
  separate: false,
  bezierAccuracy: 0.5,
  units: "mm",
  fill: "#000000",
  stroke: "",
  strokeWidth: "1",
  strokeNonScaling: false,
  fillRule: "nonzero",
  chunkSize: 100,

  async init() {
    const fontLoader = new FontLoader();
    const fonts = await fontLoader.getGoogleFonts();
    this.fontsList = fonts.items;

    // Initialize selectedFonts object with all fonts unselected
    this.fontsList.forEach((font) => {
      this.selectedFonts[font.family] = false;
    });

    if (this.fontsList.length > 0) {
      this.selectedFont = this.fontsList[0];
      this.selectedVariant = this.selectedFont.variants[0];
    }

    // Set up watcher for selectedFonts changes
    this.$watch(
      "selectedFonts",
      (value) => {
        this.updateAllFontsSelectedState();
      },
      { deep: true }
    );

    console.log("App initialized", fonts);
  },

  // Toggle all fonts selection
  selectAllFonts() {
    // Toggle the state
    this.allFontsSelected = !this.allFontsSelected;

    // Apply the state to all fonts
    this.fontsList.forEach((font) => {
      this.selectedFonts[font.family] = this.allFontsSelected;
    });
  },

  currentChunkIndex: null,

  selectNextChunk() {
    const chunkSize = this.chunkSize;
    // Reset all selections first
    this.fontsList.forEach((font) => {
      this.selectedFonts[font.family] = false;
    });

    // Calculate indices for the new chunk
    const startIndex = this.currentChunkIndex * chunkSize;
    const endIndex = startIndex + chunkSize;
    const chunk = this.fontsList.slice(startIndex, endIndex);

    // Select only fonts in the current chunk
    chunk.forEach((font) => {
      this.selectedFonts[font.family] = true;
    });

    this.currentChunkIndex++;

    // If we've gone through all fonts, reset to beginning
    if (startIndex >= this.fontsList.length) {
      this.currentChunkIndex = 0;
    }
  },

  // Update the allFontsSelected state based on individual selections
  updateAllFontsSelectedState() {
    // Check if all fonts are selected
    const allSelected = this.fontsList.every(
      (font) => this.selectedFonts[font.family]
    );

    // Update the allFontsSelected state without triggering the selectAllFonts method
    this.allFontsSelected = allSelected;
  },

  // Get all selected fonts
  getSelectedFonts() {
    return this.fontsList.filter((font) => this.selectedFonts[font.family]);
  },

  // Download all selected fonts as SVG in a zip file
  async downloadSelectedFonts() {
    const selectedFonts = this.getSelectedFonts();
    if (selectedFonts.length === 0) {
      this.handleError("No fonts selected", "font selection");
      return;
    }

    // Get the currently selected variant and size
    const targetVariant = this.selectedVariant;
    const targetSize = this.size;

    // Create a new zip file
    const zip = new JSZip();
    const fontsList = [];
    const promises = [];
    const skippedFonts = [];

    // Process each selected font
    for (const font of selectedFonts) {
      // Check if the selected variant exists for this font
      let variantToUse = null;

      if (font.variants.includes(targetVariant)) {
        // Use the selected variant if it exists
        variantToUse = targetVariant;
      } else if (this.regularAsAlt && font.variants.includes("regular")) {
        // Fall back to "regular" if allowed and available
        variantToUse = "regular";
      }

      // Skip this font if no suitable variant is found
      if (!variantToUse) {
        console.log(
          `Skipping font ${font.family}: variant ${targetVariant} not available and no fallback used`
        );
        skippedFonts.push({
          family: font.family,
          reason: `Variant ${targetVariant} not available and no fallback used`,
        });
        continue;
      }

      // Create a promise for this font
      const promise = new Promise((resolve, reject) => {
        // Get the font URL for this variant
        const fontToUse = font;
        const tempSelectedVariant = this.selectedVariant; // Store current value
        this.selectedVariant = variantToUse; // Set to the variant we're using

        const url = this.getFontUrl(fontToUse);
        const filename = `${font.family.replace(
          /\s+/g,
          "-"
        )}-${variantToUse}.svg`;

        // Generate Google Fonts download URL
        const googleFontUrl = this.getGoogleFontDownloadUrl(
          font.family,
          variantToUse
        );

        // Load the font using opentype.js
        load(url, (err, fontData) => {
          // Restore the original selected variant
          this.selectedVariant = tempSelectedVariant;

          if (err) {
            console.error(
              `Error loading font ${font.family}: ${err.message || err}`
            );
            skippedFonts.push({
              family: font.family,
              reason: `Font loading error: ${err.message || err}`,
            });
            resolve(); // Skip this font and continue with others
            return;
          }

          try {
            // Save current size
            const tempSize = this.size;
            // Use the target size for rendering
            this.size = targetSize;

            const textModel = this.createTextModel(fontData, font.family);
            const svg = this.generateSvg(textModel);

            // Restore original size
            this.size = tempSize;

            // Add the SVG to the zip file
            zip.file(filename, svg);

            // Add to fonts list for JSON
            fontsList.push({
              family: font.family,
              variant: variantToUse,
              filename: filename,
              originalVariantRequested: targetVariant,
              isFallback: variantToUse !== targetVariant,
              fontUrl: url, // Original font file URL
              googleFontsUrl: googleFontUrl, // Google Fonts download URL
            });

            resolve();
          } catch (error) {
            console.error(
              `Error generating SVG for ${font.family}: ${
                error.message || error
              }`
            );
            skippedFonts.push({
              family: font.family,
              reason: `SVG generation error: ${error.message || error}`,
            });
            resolve(); // Skip this font and continue with others
          }
        });
      });

      promises.push(promise);
    }

    try {
      // Wait for all font processing to complete
      await Promise.all(promises);

      // Add the JSON file with font information
      zip.file(
        "fonts-list.json",
        JSON.stringify(
          {
            fonts: fontsList,
            skippedFonts: skippedFonts,
            generatedAt: new Date().toISOString(),
            totalFonts: fontsList.length,
            totalSkipped: skippedFonts.length,
            chunkIndex: this.currentChunkIndex - 1, // Include the chunk index (subtract 1 because it was incremented)
            settings: {
              selectedVariant: targetVariant,
              size: targetSize,
              regularAsAlt: this.regularAsAlt,
              union: this.union,
              filled: this.filled,
              kerning: this.kerning,
              separate: this.separate,
              bezierAccuracy: this.bezierAccuracy,
              units: this.units,
              fill: this.fill,
              stroke: this.stroke,
              strokeWidth: this.strokeWidth,
              strokeNonScaling: this.strokeNonScaling,
              fillRule: this.fillRule,
            },
          },
          null,
          2
        )
      );

      // Generate the zip file with chunk index in the filename
      const zipContent = await zip.generateAsync({ type: "blob" });

      // Include the chunk index in the zip filename
      const chunkIndex = this.currentChunkIndex - 1; // Subtract 1 because it was incremented in selectNextChunk
      saveAs(zipContent, `selected-fonts-chunk-${chunkIndex}.zip`);
    } catch (error) {
      this.handleError(error, "zip generation");
    }
  },

  // Helper method to generate Google Fonts download URL
  getGoogleFontDownloadUrl(fontFamily, variant) {
    // Format the font family name for the URL (replace spaces with +)
    const formattedFamily = fontFamily.replace(/\s+/g, "+");

    // Format the variant for the URL
    // Google Fonts uses numeric weights for some variants
    let formattedVariant = variant;
    if (variant === "regular") {
      formattedVariant = "400";
    } else if (variant === "italic") {
      formattedVariant = "400italic";
    }

    // Construct the Google Fonts URL
    return `https://fonts.google.com/specimen/${formattedFamily}?preview.text=${encodeURIComponent(
      this.text
    )}&preview.text_type=custom&selection.family=${formattedFamily}:${formattedVariant}`;
  },

  // Get the font URL for the selected variant
  getFontUrl(font) {
    const fontToUse = font || this.selectedFont;
    const variant = this.selectedVariant || fontToUse.variants[0];

    let file = fontToUse.files[variant];

    if (!file && this.regularAsAlt) {
      file = fontToUse.files["regular"];
    }

    if (!file) return;

    return file.replace("http:", "https:");
  },

  // Create text model using makerjs
  createTextModel(font, textToUse) {
    // Use the font family name instead of the default text for SVG generation

    const textModel = new makerjs.models.Text(
      font,
      textToUse,
      this.size,
      this.union,
      false,
      this.bezierAccuracy,
      { kerning: this.kerning }
    );

    // Apply separate layers if needed
    if (this.separate) {
      for (const i in textModel.models) {
        textModel.models[i].layer = i;
      }
    }

    return textModel;
  },

  // Generate SVG from text model
  generateSvg(textModel) {
    return makerjs.exporter.toSVG(textModel, {
      fill: this.filled ? this.fill : undefined,
      stroke: this.stroke || undefined,
      strokeWidth: this.strokeWidth || undefined,
      fillRule: this.fillRule || undefined,
      scalingStroke: !this.strokeNonScaling,
    });
  },

  // Trigger file download
  triggerDownload(content, filename, contentType) {
    const encodedContent = window.btoa(content);
    const downloadLink = document.createElement("a");
    downloadLink.href = `data:${contentType};base64,${encodedContent}`;
    downloadLink.download = filename;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  },

  // Handle errors during font loading or SVG generation
  handleError(error, stage) {
    console.error(`Error during ${stage}:`, error);
    // Could be extended to show user-friendly error messages
  },

  // Main function to download font as SVG
  downloadAsSvg(font) {
    const fontToUse = font || this.selectedFont;

    if (!fontToUse) {
      this.handleError("No font selected", "font selection");
      return;
    }

    const url = this.getFontUrl(fontToUse);
    // Use the font family name for the filename instead of this.text
    const filename = `${fontToUse.family}.svg`;

    // Load the font using opentype.js
    load(url, (err, fontData) => {
      if (err) {
        this.handleError(err, "font loading");
        return;
      }

      try {
        const textModel = this.createTextModel(fontData, fontToUse.family);
        const svg = this.generateSvg(textModel);
        this.triggerDownload(svg, filename, "image/svg+xml");
      } catch (error) {
        this.handleError(error, "SVG generation");
      }
    });
  },
  get selectedFontsLength() {
    return Object.values(this.selectedFonts).filter(Boolean).length;
  },
  get selectedFromTo() {
    if (this.currentChunkIndex === null) return "";
    console.log(this.currentChunkIndex);

    const startIndex = (this.currentChunkIndex - 1) * this.chunkSize;
    const endIndex = startIndex + this.chunkSize;
    return `${startIndex || "0"}-${endIndex || ""}`;
  },
}));

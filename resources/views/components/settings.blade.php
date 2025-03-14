<div>
    <h2 class="text-base text-white">Font weight

        <span x-text="selectedVariant" class="font-bold"></span>
    </h2>
    <input class="w-full" type="range" x-model="selectedVariant" min="100" max="900" step="100">

    <div class="mt-1">
        <label class="flex gap-2 items-center cursor-pointer text-sm">
            <input type="checkbox" class="custom-checkbox" x-model="regularAsAlt">
            <p>Use regular if not available</p>
        </label>
        <p class="text-xs mt-1 pl-7 text-gray-400">
            If not selected, the font without selected weight will be omitted.
        </p>
    </div>

</div>


<div class="mt-6">
    <h2 class="text-base text-white">Size</h2>
    <input type="number" class="input validator" required placeholder="Type a number between 1 to 10" min="1"
        max="999" x-model="size" title="Must be between be 1 to 10" />
    <p class="validator-hint">Must be between be 1 to 999</p>
</div>


<div class="mt-10">
    <button class="btn" @click="downloadSelectedFonts">Download selected</button>
    <p class="text-xs text-gray-400 pt-2 pl-4">
        This will download the selected fonts as SVG files in a zip file.
    </p>
</div>

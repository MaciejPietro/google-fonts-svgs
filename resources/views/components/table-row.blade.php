<tr>
    <th>
        <label>
            <input type="checkbox" class="custom-checkbox" x-model="selectedFonts[font.family]" />
        </label>
    </th>
    <td>
        <div class="flex items-center gap-3">
            <div>
                <div class="font-bold" x-text="font.family"></div>
                {{-- <div class="text-sm opacity-50" x-text="font.variants"></div> --}}
            </div>
        </div>
    </td>
    <td>
        <div class="text-sm opacity-50 w-40 whitespace-normal" x-text="font.variants.join(', ')"></div>
    </td>
    <th>
        <button type="button" @click="downloadAsSvg(font)" class="btn">.svg</button>
    </th>
</tr>

<div class="overflow-x-auto">

    <div class="flex justify-between items-center mb-6">
        <h2 class=" text-gray-400 text-sm">
            Total fonts: <span x-text="fontsList.length"></span> <br />
            Selected fonts: <span x-text="selectedFontsLength "></span>
        </h2>

    </div>

    <table class="table">
        <!-- head -->
        @include('components.table-head')
        <tbody>
            <template x-for="font in fontsList" x-key="font.family">
                @include('components.table-row')
            </template>

        </tbody>

    </table>
</div>

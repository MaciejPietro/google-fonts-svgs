<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Standalone Blade with Vite</title>
    <script type="module" src="http://localhost:5173/@vite/client"></script>
    <script type="module" src="http://localhost:5173/resources/js/app.js"></script>
    <link rel="stylesheet" href="http://localhost:5173/resources/css/app.css">
</head>

<body class="bg-[#1D232A]">
    <div x-data="app" class="container mx-auto grid grid-cols-3 gap-12">
        <div class="col-span-2">

            <div class="relative overflow-x-auto shadow-md sm:rounded-lg py-10">
                {{-- @include('components.search') --}}
                @include('components.table')
            </div>


        </div>

        <div>
            <div class="sticky pt-10 top-12">
                @include('components.settings')

                {{-- <button
                    class="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:opacity-[0.85] rounded-full"
                    type="button">
                    Gradient
                </button>
                <button
                    class="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 border border-white text-white hover:opacity-75 focus:ring focus:ring-white/30 active:opacity-[0.85] rounded-full"
                    type="button">
                    Outlined
                </button>
                <button
                    class="px-6 py-3 font-sans text-xs font-bold text-center text-white uppercase align-middle transition-all rounded-full select-none disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none hover:bg-white/10 active:bg-white/20"
                    type="button">
                    Text
                </button> --}}
            </div>
        </div>
    </div>
</body>

</html>

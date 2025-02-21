<script>
  import { onMount } from 'svelte';

  let widths = [ 1920, 1600, 1366, 1280, 1024, 768, 640, 480, 320, 240, 150 ]
  
  let files = $state([])
  let zipURL = $state('')
  let selectedWidths = $state([1024, 768, 480])
  let fileInput = $state(null)

  function handleFileChange(event) {
    files = Array.from(event.target.files);
  }

  async function uploadFiles() {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    selectedWidths.forEach(size => formData.append('widths', size));

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const { zipPath } = await response.json();
      zipURL = zipPath;
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = Array.from(event.dataTransfer.files);
    files = [...files, ...droppedFiles];
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('drag-over');
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
  }
</script>

<main class="w-full h-full flex items-center text-gray-700">
  <section class="max-w-4xl mx-auto p-12 bg-gray-50 flex flex-col gap-6  drop-shadow-lg rounded-lg">
    <h1 class="text-3xl font-bold text-indigo-700">Image Size Derivator 😊</h1>

    <div class="flex flex-col gap-2">
      <h3 class="text-base font-medium uppercase">Derivating widths</h3>
      <ul class="flex flex-wrap gap-x-4">
        {#each widths as width}
          <li>
            <label class="text-sm">
              <input type="checkbox" bind:group={selectedWidths} value={width} />
              {width}px
            </label>
          </li>
        {/each}
      </ul> 
    </div>

    <div 
      class="border-2 border-dashed border-indigo-100 hover:border-indigo-200 rounded-lg p-6 text-center cursor-pointer"
      ondrop={handleDrop}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      onclick={() => fileInput.click()}
      onkeydown={(event) => { if (event.key === 'Enter' || event.key === ' ') fileInput.click(); }}
      role="button"
      tabindex="0"
    >
      <p>Drop your images or click to select them</p>
      <input bind:this={fileInput} type="file" multiple accept=".webp,.png,.jpg,.jpeg" onchange={handleFileChange} class="hidden"/>
    </div>

    <div class="flex flex-wrap gap-4">
      {#each files as file, index}
        <div class="relative">
          <img src={URL.createObjectURL(file)} alt={file.name} class="w-24 h-24 object-cover rounded-lg bg-indigo-100" />

          <button 
            class="absolute top-0 right-0 bg-fuchsia-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-fuchsia-700"
            onclick={() => files = files.filter((_, i) => i !== index)}
          >
            ×
          </button>
        </div>
      {/each}
    </div>

    <div class="flex gap-4">
      <button disabled={!files.length} onclick={() => files = []} class="border-1 border-indigo-500 enabled:hover:bg-indigo-50 enabled:hover:border-indigo-700 enabled:hover:text-indigo-700 disabled:opacity-30 rounded-lg py-2 px-4 text-indigo-500 enabled:cursor-pointer">Clean Images</button>
      <button disabled={!files.length || !selectedWidths.length} onclick={uploadFiles} class="bg-indigo-500 enabled:hover:bg-indigo-700 disabled:opacity-30 rounded-lg py-2 px-4 text-white enabled:cursor-pointer">Derivate!</button>
      {#if zipURL}
        <a class="bg-indigo-500 hover:bg-indigo-700 disabled:opacity-30 rounded-lg py-2 px-4 text-white cursor-pointer" href={zipURL} download="image-derivates.zip">Download!</a>
      {/if}
    </div>

    <p class="mt-4 text-xs text-right">Created by <a class="font-bold italic underline hover:cursor-pointer hover:text-indigo-700" target="_blank" href="https://odd.studio/">Odd Data & Design Studio</a></p>
  </section>
</main>
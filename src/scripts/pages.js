for(const image of document.querySelectorAll('[data-image-fallback]')){
  const failed=()=>image.parentElement.classList.add('missing');
  image.addEventListener('error',failed);
  if(image.complete&&!image.naturalWidth)failed();
}

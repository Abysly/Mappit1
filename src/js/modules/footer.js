export async function loadFooter() {
  const res = await fetch("/src/components/footer.html");
  const footer = await res.text();
  document.getElementById("footer").innerHTML = footer;
}

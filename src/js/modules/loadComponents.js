export async function loadNavbar() {
  const navbarHTML = await fetch("/src/components/navbar.html").then((res) =>
    res.text()
  );
  document.body.insertAdjacentHTML("afterbegin", navbarHTML);
}

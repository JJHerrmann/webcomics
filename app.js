const title = document.querySelector("#title");
const collection = document.querySelector("#collection");
const position = document.querySelector("#position");
const image = document.querySelector("#comic-image");
const archiveGroups = document.querySelector("#archive-groups");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
const count = document.querySelector("#count");

let comics = [];
let active = 0;

function show(index, updateHash = true) {
  if (!comics.length) return;
  active = Math.max(0, Math.min(index, comics.length - 1));
  const comic = comics[active];
  const isReboot = comic.collection.toLowerCase().includes("reboot");
  const isUntitled = comic.collection.toLowerCase().includes("untitled");
  const isRfas = comic.collection.toLowerCase().includes("roll for a save");
  const era = isReboot ? "No Clue‽ The Reboot" : isRfas ? "Roll for a Save" : isUntitled ? "Untitled Webcomic.txt" : "No Clue‽";
  document.title = `${era} — ${comic.title}`;
  title.textContent = comic.title;
  collection.textContent = comic.collection;
  position.textContent = `Page ${active + 1} of ${comics.length}`;
  image.src = comic.image;
  image.alt = `${comic.title}, from No Clue! ${comic.collection}`;
  image.hidden = false;
  previous.disabled = active === 0;
  next.disabled = active === comics.length - 1;
  document.querySelectorAll(".thumb").forEach(button => button.setAttribute("aria-current", String(Number(button.dataset.index) === active)));
  if (updateHash) history.replaceState(null, "", `#${comic.id}`);
}

previous.addEventListener("click", () => show(active - 1));
next.addEventListener("click", () => show(active + 1));
document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") show(active - 1);
  if (event.key === "ArrowRight") show(active + 1);
});

try {
  const response = await fetch("public/comics.json", { cache: "no-store" });
  ({ comics } = await response.json());
  count.textContent = `${comics.length} located page${comics.length === 1 ? "" : "s"}`;
  const grouped = new Map();
  comics.forEach((comic, index) => {
    if (!grouped.has(comic.collection)) grouped.set(comic.collection, []);
    grouped.get(comic.collection).push({ comic, index });
  });
  for (const [era, items] of grouped) {
    const isReboot = era.toLowerCase().includes("reboot");
    const isUntitled = era.toLowerCase().includes("untitled");
    const isRfas = era.toLowerCase().includes("roll for a save");
    const card = isReboot ? "no-clue-reboot.png" : isUntitled ? "untitled-webcomic.png" : "no-clue.png";
    const eraMark = isRfas
      ? '<img src="public/title-cards/roll-for-a-save.png" alt="Roll for a Save">'
      : `<img class="${isUntitled ? "invert" : ""}" src="public/title-cards/${card}" alt="${era}">`;
    const eraDescription = isRfas
      ? "A short-lived webcomic idea written by Bobby Lombardo and illustrated by Jake Herrmann."
      : isReboot
        ? "An unreleased reboot of the original series, with D. Mongeni and Jake Herrmann reprising their roles as writer and artist."
        : "A short-run comic series written by D. Mongeni and illustrated and edited by Jake Herrmann under the Long Haired Syndicate Studios banner. It ran from October 2012 to January 2013. Unlike many webcomics of its era, it was drawn entirely in Illustrator using the shape tool and reusable character models.";
    const group = document.createElement("section");
    group.className = "archive-group";
    group.innerHTML = `
      <div class="archive-era">
        ${eraMark}
        <p>${eraDescription}</p>
        <span>${items.length} page${items.length === 1 ? "" : "s"}</span>
      </div>
      <div class="thumbs"></div>
    `;
    const grid = group.querySelector(".thumbs");
    items.forEach(({ comic, index }) => {
      const button = document.createElement("button");
      button.className = "thumb";
      button.dataset.index = index;
      button.title = `${comic.title} — ${comic.collection}`;
      button.innerHTML = `<img src="${comic.image}" alt=""><span>${comic.title}</span>`;
      button.addEventListener("click", () => {
        show(index);
        document.querySelector("#read").scrollIntoView({ behavior: "smooth" });
      });
      grid.append(button);
    });
    archiveGroups.append(group);
  }
  const requested = comics.findIndex(comic => `#${comic.id}` === location.hash);
  show(requested >= 0 ? requested : comics.length - 1, false);
} catch {
  title.textContent = "No located pages yet";
  position.textContent = "Add images under content/comics, then run npm run sync.";
}

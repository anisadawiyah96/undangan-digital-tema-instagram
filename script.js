const weddingDate = new Date("2026-12-12T08:00:00+07:00").getTime();
const music = document.querySelector("#bgMusic");
const musicToggle = document.querySelector("#musicToggle");
const openInvitation = document.querySelector("#openInvitation");
const toast = document.querySelector("#toast");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const closeLightbox = document.querySelector("#closeLightbox");

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 1700);
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
  revealObserver.observe(item);
});

const formatLikes = (count) => new Intl.NumberFormat("id-ID").format(count);

document.querySelectorAll(".post-card").forEach((post) => {
  const likeButton = post.querySelector(".like-button");
  const likeCount = post.querySelector(".like-count");
  let likes = Number(post.dataset.likes || 0);
  let liked = false;

  const popHeart = () => {
    post.classList.remove("pop-heart");
    void post.offsetWidth;
    post.classList.add("pop-heart");
  };

  const setLiked = () => {
    if (!likeButton || liked) return;
    liked = true;
    likes += 1;
    likeButton.classList.add("liked");
    likeButton.textContent = "♥";
    if (likeCount) likeCount.textContent = formatLikes(likes);
    popHeart();
  };

  if (likeButton) likeButton.addEventListener("click", setLiked);

  const image = post.querySelector(".post-image");
  if (image) {
    image.addEventListener("dblclick", setLiked);
    image.addEventListener("click", (event) => {
      const now = Date.now();
      if (now - (image.lastTap || 0) < 330) setLiked();
      image.lastTap = now;
      event.preventDefault();
    });
  }
});

const updateCountdown = () => {
  const now = Date.now();
  const distance = Math.max(weddingDate - now, 0);
  const values = {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60)
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.querySelector(`#${id}`);
    if (!element) return;
    if (element.textContent !== String(value)) {
      element.textContent = value;
      element.classList.remove("tick");
      void element.offsetWidth;
      element.classList.add("tick");
    }
  });
};

updateCountdown();
setInterval(updateCountdown, 1000);

const playMusic = async () => {
  try {
    await music.play();
    musicToggle.classList.add("is-playing");
    musicToggle.setAttribute("aria-label", "Jeda musik");
  } catch {
    showToast("Klik tombol musik untuk memutar");
  }
};

openInvitation.addEventListener("click", async () => {
  await playMusic();
  document.querySelector("#countdown").scrollIntoView({ behavior: "smooth", block: "start" });
});

musicToggle.addEventListener("click", async () => {
  if (music.paused) {
    await playMusic();
  } else {
    music.pause();
    musicToggle.classList.remove("is-playing");
    musicToggle.setAttribute("aria-label", "Putar musik");
  }
});

document.querySelectorAll(".gallery-grid button").forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.querySelector("img");
    lightboxImage.src = image.src.replace("w=700", "w=1400");
    lightboxImage.alt = image.alt;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  });
});

const closePreview = () => {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
};

closeLightbox.addEventListener("click", closePreview);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closePreview();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePreview();
});

document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      showToast("Copied!");
    } catch {
      showToast(value);
    }
  });
});

document.querySelector("#rsvpForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name") || "").trim();
  const guests = String(form.get("guests") || "1").trim();
  const attendance = String(form.get("attendance"));
  const message = String(form.get("message") || "").trim();

  if (!name) return;

  const item = document.createElement("li");
  item.textContent =
    attendance === "InsyaAllah hadir"
      ? `${name} - ${attendance} (${guests} orang)${message ? ` - "${message}"` : ""}`
      : `${name} - ${attendance}${message ? ` - "${message}"` : ""}`;
  document.querySelector("#guestList").prepend(item);
  event.currentTarget.reset();
  showToast("RSVP terkirim");
});

let storyIndex = 0;
const stories = document.querySelectorAll(".story-item");
setInterval(() => {
  stories.forEach((story) => story.classList.remove("active-story"));
  if (stories[storyIndex]) stories[storyIndex].classList.add("active-story");
  storyIndex = (storyIndex + 1) % stories.length;
}, 1800);

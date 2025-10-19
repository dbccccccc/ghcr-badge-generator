const state = {
  owner: "",
  repo: "",
  packageLoaded: false,
};

const repoInput = document.getElementById("repo-url");
const repoStatus = document.getElementById("repo-status");
const loadPackagesButton = document.getElementById("load-packages");

const packageSection = document.getElementById("step-package");
const customizeSection = document.getElementById("step-customize");
const previewSection = document.getElementById("step-preview");
const outputSection = document.getElementById("step-output");

const packageSelect = document.getElementById("package-select");
const packageInput = document.getElementById("package-input");

const labelInput = document.getElementById("badge-label");
const logoSelect = document.getElementById("badge-logo");
const colorSelect = document.getElementById("badge-color");
const styleSelect = document.getElementById("badge-style");

const badgePreview = document.getElementById("badge-preview");

const jsonUrlInput = document.getElementById("json-url");
const jsonMarkdownInput = document.getElementById("json-markdown");
const jsonHtmlInput = document.getElementById("json-html");
const directUrlInput = document.getElementById("direct-url");
const directMarkdownInput = document.getElementById("direct-markdown");

const toast = document.getElementById("toast");
const toastMessage = toast.querySelector(".toast-message");
let toastTimeout;

function setHint(element, message, tone) {
  element.textContent = message;
  element.classList.remove("hint--success", "hint--error", "hint--info");
  if (tone) {
    element.classList.add(`hint--${tone}`);
  }
}

function showSection(section) {
  section.classList.remove("is-hidden");
  section.setAttribute("aria-hidden", "false");
  
  // Add smooth scroll to newly revealed section
  setTimeout(() => {
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function hideSection(section) {
  section.classList.add("is-hidden");
  section.setAttribute("aria-hidden", "true");
}

function resetFlow() {
  state.packageLoaded = false;
  packageSelect.innerHTML = "";
  packageSelect.disabled = true;
  packageInput.value = "";

  hideSection(packageSection);
  hideSection(customizeSection);
  hideSection(previewSection);
  hideSection(outputSection);

  badgePreview.removeAttribute("src");
  jsonUrlInput.value = "";
  jsonMarkdownInput.value = "";
  jsonHtmlInput.value = "";
  directUrlInput.value = "";
  directMarkdownInput.value = "";
}

function parseRepository(value) {
  const pattern = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?\/?$/i;
  const match = value.trim().match(pattern);

  if (!match) {
    state.owner = "";
    state.repo = "";
    loadPackagesButton.disabled = true;
    setHint(repoStatus, "Enter the full URL of a GitHub repository.", "error");
    resetFlow();
    return;
  }

  const [, owner, repo] = match;
  const normalizedRepo = repo.replace(/\.git$/i, "");

  if (state.owner !== owner || state.repo !== normalizedRepo) {
    resetFlow();
  }

  state.owner = owner;
  state.repo = normalizedRepo;
  loadPackagesButton.disabled = false;
  setHint(repoStatus, `Ready: ${owner}/${normalizedRepo}`, "success");
}

function populateDefaultPackage() {
  if (!state.owner || !state.repo) {
    setHint(repoStatus, "Add a valid repository URL before continuing.", "error");
    return;
  }

  packageSelect.innerHTML = "";
  const option = document.createElement("option");
  option.value = state.repo;
  option.textContent = state.repo;
  packageSelect.appendChild(option);
  packageSelect.disabled = false;

  packageInput.value = state.repo;
  state.packageLoaded = true;

  showSection(packageSection);
  
  // Stagger the appearance of sections for better UX
  setTimeout(() => showSection(customizeSection), 150);
  setTimeout(() => showSection(previewSection), 300);
  setTimeout(() => showSection(outputSection), 450);

  setHint(
    repoStatus,
    `Using ${state.repo} as the default package. Adjust if the package name differs.`,
    "info",
  );
  updateOutputs();
}

function buildJsonBadgeUrl(apiUrl, options) {
  const badgeUrl = new URL("https://img.shields.io/badge/dynamic/json");
  const params = badgeUrl.searchParams;
  params.set("url", apiUrl);
  params.set("query", "downloadCount");
  params.set("label", options.label);

  if (options.logo && options.logo !== "none") {
    params.set("logo", options.logo);
  } else {
    params.delete("logo");
  }

  if (options.color && options.color !== "default") {
    params.set("color", options.color);
  } else {
    params.delete("color");
  }

  if (options.style && options.style !== "flat") {
    params.set("style", options.style);
  } else {
    params.delete("style");
  }

  return badgeUrl.toString();
}

function updateOutputs() {
  if (!state.packageLoaded) {
    return;
  }

  const packageName = (packageInput.value || packageSelect.value || "").trim();
  if (!state.owner || !state.repo || !packageName) {
    badgePreview.removeAttribute("src");
    jsonUrlInput.value = "";
    jsonMarkdownInput.value = "";
    jsonHtmlInput.value = "";
    directUrlInput.value = "";
    directMarkdownInput.value = "";
    return;
  }

  const label = (labelInput.value || "ghcr pulls").trim();
  const encodedOwner = encodeURIComponent(state.owner);
  const encodedRepo = encodeURIComponent(state.repo);
  const encodedPackage = encodeURIComponent(packageName);

  const apiUrl = `https://ghcr-badge.elias.eu.org/api/${encodedOwner}/${encodedRepo}/${encodedPackage}`;
  const jsonBadgeUrl = buildJsonBadgeUrl(apiUrl, {
    label,
    logo: logoSelect.value,
    color: colorSelect.value,
    style: styleSelect.value,
  });
  const directShieldUrl = `https://ghcr-badge.elias.eu.org/shield/${encodedOwner}/${encodedRepo}/${encodedPackage}`;

  badgePreview.src = jsonBadgeUrl;
  badgePreview.alt = label;

  jsonUrlInput.value = jsonBadgeUrl;
  jsonMarkdownInput.value = `![${label}](${jsonBadgeUrl})`;
  jsonHtmlInput.value = `<img src="${jsonBadgeUrl}" alt="${label}">`;

  directUrlInput.value = directShieldUrl;
  directMarkdownInput.value = `![GHCR Pulls](${directShieldUrl})`;
}

async function copyToClipboard(text, trigger) {
  if (!text) {
    showToast("Nothing to copy yet. Complete the steps above first.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
    if (trigger) {
      const originalText = trigger.innerHTML;
      trigger.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Copied!
      `;
      trigger.disabled = true;
      setTimeout(() => {
        trigger.innerHTML = originalText;
        trigger.disabled = false;
      }, 2000);
    }
  } catch {
    showToast("Copy failed. Please select the text manually.");
  }
}

function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3000);
}

// Event listeners
repoInput.addEventListener("input", (event) => {
  parseRepository(event.target.value);
});

loadPackagesButton.addEventListener("click", populateDefaultPackage);

packageSelect.addEventListener("change", (event) => {
  packageInput.value = event.target.value;
  updateOutputs();
});

packageInput.addEventListener("input", updateOutputs);
labelInput.addEventListener("input", updateOutputs);
logoSelect.addEventListener("change", updateOutputs);
colorSelect.addEventListener("change", updateOutputs);
styleSelect.addEventListener("change", updateOutputs);

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-copy-target");
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    const value = "value" in target ? target.value : target.textContent;
    copyToClipboard(value, button);
  });
});

// Initialize defaults on first load
loadPackagesButton.disabled = true;
setHint(repoStatus, "Enter the full URL of a GitHub repository.", "info");
resetFlow();

// Add smooth reveal animation on page load
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.page-header');
  const firstCard = document.querySelector('#step-repo');
  
  header.style.opacity = '0';
  header.style.transform = 'translateY(-20px)';
  firstCard.style.opacity = '0';
  firstCard.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    header.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    header.style.opacity = '1';
    header.style.transform = 'translateY(0)';
  }, 100);
  
  setTimeout(() => {
    firstCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    firstCard.style.opacity = '1';
    firstCard.style.transform = 'translateY(0)';
  }, 250);
});


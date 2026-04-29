document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const navbar = document.querySelector(".custom-navbar");
    const navbarCollapse = document.querySelector(".navbar-collapse");
    const navLinks = Array.from(document.querySelectorAll(".navbar .nav-link"));
    const revealItems = document.querySelectorAll(".reveal");
    const filterButtons = document.querySelectorAll("[data-filter]");
    const filterCards = document.querySelectorAll("[data-project-category]");
    const samePageAnchors = navLinks.filter((link) => {
        const href = link.getAttribute("href") || "";
        return href.startsWith("#");
    });

    const setCurrentYear = () => {
        document.querySelectorAll("[data-year]").forEach((node) => {
            node.textContent = new Date().getFullYear();
        });
    };

    const toggleNavbarState = () => {
        if (!navbar) {
            return;
        }

        navbar.classList.toggle("scrolled", window.scrollY > 18);
    };

    const closeMobileMenu = () => {
        if (navbarCollapse && navbarCollapse.classList.contains("show")) {
            const collapseInstance = bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
            collapseInstance.hide();
        }
    };

    const setActiveLink = (targetHref) => {
        navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === targetHref;
            link.classList.toggle("active", isActive);
            link.setAttribute("aria-current", isActive ? "page" : "false");
        });
    };

    const initSmoothScroll = () => {
        samePageAnchors.forEach((link) => {
            link.addEventListener("click", (event) => {
                const targetHref = link.getAttribute("href");
                const target = targetHref ? document.querySelector(targetHref) : null;

                if (!target) {
                    return;
                }

                event.preventDefault();
                const offset = navbar ? navbar.offsetHeight : 0;
                const position = target.getBoundingClientRect().top + window.scrollY - offset + 2;

                window.scrollTo({
                    top: position,
                    behavior: "smooth"
                });

                setActiveLink(targetHref);
                closeMobileMenu();
            });
        });

        navLinks
            .filter((link) => !(link.getAttribute("href") || "").startsWith("#"))
            .forEach((link) => {
                link.addEventListener("click", closeMobileMenu);
            });
    };

    const initSectionObserver = () => {
        if (body.dataset.page !== "home" || !("IntersectionObserver" in window)) {
            return;
        }

        const observedSections = samePageAnchors
            .map((link) => document.querySelector(link.getAttribute("href")))
            .filter(Boolean);

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleSection = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visibleSection?.target?.id) {
                    setActiveLink(`#${visibleSection.target.id}`);
                }
            },
            {
                rootMargin: "-35% 0px -45% 0px",
                threshold: [0.2, 0.35, 0.5, 0.7]
            }
        );

        observedSections.forEach((section) => observer.observe(section));
    };

    const initReveal = () => {
        if (!("IntersectionObserver" in window)) {
            revealItems.forEach((item) => item.classList.add("is-visible"));
            return;
        }

        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.16
            }
        );

        revealItems.forEach((item) => revealObserver.observe(item));
    };

    const initFilters = () => {
        if (!filterButtons.length || !filterCards.length) {
            return;
        }

        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const selectedFilter = button.dataset.filter || "all";

                filterButtons.forEach((btn) => btn.classList.toggle("active", btn === button));

                filterCards.forEach((card) => {
                    const category = card.dataset.projectCategory || "";
                    const shouldShow = selectedFilter === "all" || category.includes(selectedFilter);
                    card.classList.toggle("hidden", !shouldShow);
                });
            });
        });
    };

    toggleNavbarState();
    setCurrentYear();
    initSmoothScroll();
    initSectionObserver();
    initReveal();
    initFilters();

    window.addEventListener("scroll", toggleNavbarState);

    if (body.dataset.page === "projects") {
        setActiveLink("proyectos.html");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".custom-navbar");
    const navLinks = document.querySelectorAll(".navbar .nav-link");
    const navbarCollapse = document.querySelector(".navbar-collapse");
    const quoteForm = document.getElementById("quoteForm");
    const feedbackBox = document.getElementById("formFeedback");

    // Inicializa animaciones on-scroll.
    if (typeof AOS !== "undefined") {
        AOS.init({
            duration: 800,
            easing: "ease-out-cubic",
            once: true,
            offset: 80
        });
    }

    // Cambia el estilo del navbar al hacer scroll.
    const toggleNavbarState = () => {
        if (!navbar) {
            return;
        }

        navbar.classList.toggle("scrolled", window.scrollY > 30);
    };

    toggleNavbarState();
    window.addEventListener("scroll", toggleNavbarState);

    const setActiveNavLink = (targetId) => {
        navLinks.forEach((navLink) => {
            const isCurrent = navLink.getAttribute("href") === targetId;
            navLink.classList.toggle("active", isCurrent);
            navLink.setAttribute("aria-current", isCurrent ? "page" : "false");
        });
    };

    // Refuerza el scroll suave con offset para el navbar fijo.
    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || !targetId.startsWith("#")) {
                return;
            }

            const targetSection = document.querySelector(targetId);

            if (!targetSection) {
                return;
            }

            event.preventDefault();
            setActiveNavLink(targetId);

            const navHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - navHeight + 2;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

            // Cierra el menú móvil después de navegar.
            if (navbarCollapse && navbarCollapse.classList.contains("show")) {
                const collapseInstance = bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
                collapseInstance.hide();
            }
        });
    });

    // Mantiene solo un enlace activo según la sección visible.
    const observedSections = Array.from(navLinks)
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if ("IntersectionObserver" in window && observedSections.length > 0) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visibleEntry?.target?.id) {
                    setActiveNavLink(`#${visibleEntry.target.id}`);
                }
            },
            {
                root: null,
                rootMargin: "-35% 0px -45% 0px",
                threshold: [0.2, 0.35, 0.5, 0.7]
            }
        );

        observedSections.forEach((section) => sectionObserver.observe(section));
    }

    // Manejo visual y validación básica del formulario del modal.
    if (quoteForm && feedbackBox) {
        quoteForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const formData = new FormData(quoteForm);
            const payload = Object.fromEntries(formData.entries());
            const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email || "");
            const hasEmptyFields = Object.values(payload).some((value) => String(value).trim() === "");

            feedbackBox.className = "form-feedback";

            if (hasEmptyFields || !isValidEmail) {
                feedbackBox.classList.add("error");
                feedbackBox.textContent = "Por favor completa todos los campos con información válida antes de enviar tu solicitud.";
                return;
            }

            feedbackBox.classList.add("success");
            feedbackBox.textContent = "Solicitud enviada correctamente. En un proyecto real, aquí puedes conectar el formulario con tu correo o backend.";
            console.log("Solicitud de cotización:", payload);
            quoteForm.reset();
        });
    }

    // Limpia el mensaje al reabrir el modal.
    const contactModal = document.getElementById("contactModal");

    if (contactModal && feedbackBox && quoteForm) {
        contactModal.addEventListener("show.bs.modal", () => {
            feedbackBox.className = "form-feedback d-none";
            feedbackBox.textContent = "";
        });

        contactModal.addEventListener("hidden.bs.modal", () => {
            feedbackBox.className = "form-feedback d-none";
            feedbackBox.textContent = "";
            quoteForm.reset();
        });
    }
});

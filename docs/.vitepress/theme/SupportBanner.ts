import { useRoute } from "vitepress";
import { defineComponent, h, onMounted, ref, watch } from "vue";

const carbonScript = "https://cdn.carbonads.com/carbon.js?serve=CW7I5KJE&placement=albumentationsai&format=cover";

export default defineComponent({
  name: "SupportBanner",
  setup() {
    const route = useRoute();
    const adSlot = ref<HTMLElement | null>(null);

    function loadAd() {
      const slot = adSlot.value;
      if (!slot || !import.meta.env.PROD) {
        return;
      }
      slot.replaceChildren();
      const script = document.createElement("script");
      script.async = true;
      script.id = "_carbonads_js";
      script.src = carbonScript;
      slot.append(script);
    }

    onMounted(loadAd);
    watch(() => route.path, loadAd);

    return () =>
      h("div", { class: "support-banner" }, [
        h("a", { class: "support-star", href: "https://github.com/albumentations-team/AlbumentationsX" }, [
          h("span", { class: "support-star-icon", "aria-hidden": "true" }, "★"),
          h("span", [h("strong", "Star AlbumentationsX on GitHub"), h("small", "Support the team behind js-tools")]),
          h("span", { class: "support-star-arrow", "aria-hidden": "true" }, "↗"),
        ]),
        h("aside", { class: "support-ad", "aria-label": "Advertisement", ref: adSlot }),
      ]);
  },
});

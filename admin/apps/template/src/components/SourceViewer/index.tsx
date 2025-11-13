import { defineComponent } from "vue";
import "./style.scss";
import { copyText } from "@/utils/copy";
import { message } from "@anteng/ui";

export default defineComponent({
  name: "SourceViewer",
  props: {
    code: { type: String, required: true },
    lang: { type: String, default: "tsx" },
    filename: { type: String, default: "" },
    height: { type: [String, Number], default: 420 },
  },
  setup(props) {
    const handleCopy = async () => {
      const ok = await copyText(props.code);
      if (ok) message.success("源码已复制到剪贴板");
      else message.error("复制失败，请手动复制");
    };

    return () => (
      <div class="source-viewer">
        <div class="source-viewer__header">
          <span class="source-viewer__title">{props.filename || "源码"}</span>
          <button class="source-viewer__copy" onClick={handleCopy}>
            复制
          </button>
        </div>
        <pre
          class="source-viewer__body"
          style={{
            height:
              typeof props.height === "number"
                ? `${props.height}px`
                : props.height,
          }}
        >
          <code>{props.code}</code>
        </pre>
      </div>
    );
  },
});

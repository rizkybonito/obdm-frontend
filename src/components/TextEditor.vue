<script>
import { ref, watch, onMounted, toRefs, computed } from "vue";

export default {
  name: "TextEditor",
  props: {
    modelValue: {
      type: String,
      default: "<p></p>",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const { modelValue, disabled, readonly } = toRefs(props);
    const editor = ref(null);

    onMounted(() => {
      if (editor.value) {
        editor.value.innerHTML = modelValue.value || "<p></p>";
      }
    });

    const handleTab = (event) => {
      if (disabled.value || readonly.value) return;
      if (event.key === "Tab") {
        event.preventDefault();
        document.execCommand("insertHTML", false, "&nbsp;&nbsp;");
      }
    };

    const execCommand = (command) => {
      if (disabled.value || readonly.value) return;
      document.execCommand(command, false, null);
      editor.value.focus();
    };

    const createLink = () => {
      if (disabled.value || readonly.value) return;
      const url = prompt("Enter the URL");
      if (url) {
        document.execCommand("createLink", false, url);
      }
      editor.value.focus();
    };

    const justifyText = () => {
      if (disabled.value || readonly.value) return;
      document.execCommand("justifyFull", false, null);
      editor.value.focus();
    };

    const unjustifyText = () => {
      if (disabled.value || readonly.value) return;
      document.execCommand("justifyLeft", false, null);
      editor.value.focus();
    };

    const updateContent = () => {
      if (disabled.value || readonly.value) return;
      let newContent = editor.value.innerHTML;

      if (!newContent || newContent.trim() === "") {
        newContent = "<p></p>";
      }

      emit("update:modelValue", newContent);
    };

    watch(modelValue, (newContent) => {
      if (editor.value && editor.value.innerHTML !== newContent) {
        editor.value.innerHTML = newContent;
      }
    });

    const isDisabledOrReadonly = computed(() => disabled.value || readonly.value);

    return {
      editor,
      execCommand,
      createLink,
      updateContent,
      isDisabledOrReadonly,
      handleTab,
      justifyText,
      unjustifyText,
    };
  },
};
</script>

<template>
  <div class="text-editor-container">
    <div class="toolbar">
      <button @click="execCommand('bold')" :disabled="isDisabledOrReadonly">Bold</button>
      <button @click="execCommand('italic')" :disabled="isDisabledOrReadonly">Italic</button>
      <button @click="execCommand('underline')" :disabled="isDisabledOrReadonly">Underline</button>
      <button @click="createLink" :disabled="isDisabledOrReadonly">Link</button>
      <button @click="execCommand('indent')" :disabled="isDisabledOrReadonly">Indent Paragraph</button>
      <button @click="execCommand('outdent')" :disabled="isDisabledOrReadonly">Outdent Paragraph</button>
      <button @click="justifyText" :disabled="isDisabledOrReadonly">Justify</button>
      <button @click="unjustifyText" :disabled="isDisabledOrReadonly">Unjustify</button>
    </div>

    <div
      class="editor"
      ref="editor"
      @input="updateContent"
      @keydown="handleTab"
      :style="{ minHeight: '200px', border: '1px solid #ccc', padding: '10px' }"
      :contenteditable="!isDisabledOrReadonly"
      :class="{ 'disabled': isDisabledOrReadonly, 'readonly': readonly.value }"
    ></div>
  </div>
</template>

<style scoped>
.editor {
  min-height: 200px;
  border: 1px solid #f1f1f1;
  padding: 10px;
  font-size: 16px;
  line-height: 1.5;
  text-align: left;
}

.text-editor-container {
  width: 100%;
  margin: 20px auto;
  font-family: Arial, sans-serif;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.toolbar button {
  padding: 5px 10px;
  border: none;
  background-color: #f4f4f4;
  cursor: pointer;
  font-size: 14px;
}

.toolbar button:hover {
  background-color: #ddd;
}

.toolbar button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

.editor.readonly {
  background-color: #f9f9f9;
  cursor: not-allowed;
}

.editor.disabled {
  background-color: #e9e9e9;
  cursor: not-allowed;
}
</style>

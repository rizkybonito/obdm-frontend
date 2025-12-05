<script setup>
import { ref } from 'vue';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const editor = ref(ClassicEditor);

// Configure CKEditor toolbar
ClassicEditor.create(document.querySelector('#editor'), {
    toolbar: ['bold', 'italic', 'link', '|', 'undo', 'redo']
})
    .then((editorInstance) => {
        editor.value = editorInstance;
    })
    .catch((error) => {
        console.error(error);
    });
</script>

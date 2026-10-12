<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  inline: { type: Boolean, default: false },
  log: { type: Boolean, default: false }
});

const host = ref(null);
const lines = ref([]);
let library = null;
let detach = null;

function describe(event) {
  if (event.type.startsWith('fdp:')) {
    const value = event.detail?.picker?.getValue();
    return typeof value === 'object' && value !== null ? JSON.stringify(value) : `"${value ?? ''}"`;
  }
  return `${event.target.name || event.target.id}="${event.target.value}"`;
}

function record(event) {
  lines.value = [`${event.type}  ${describe(event)}`, ...lines.value].slice(0, 6);
}

onMounted(async () => {
  library = await import('flow-datepicker');
  const node = host.value;
  library.FlowDatepicker.init(node);
  if (props.log) {
    const names = ['change', 'fdp:open', 'fdp:close'];
    names.forEach((name) => node.addEventListener(name, record));
    detach = () => names.forEach((name) => node.removeEventListener(name, record));
  }
});

onBeforeUnmount(() => {
  detach?.();
  if (library && host.value) {
    library.FlowDatepicker.destroy(host.value);
  }
});
</script>

<template>
  <div class="fdp-demo">
    <div ref="host" :class="['fdp-demo-body', { 'fdp-demo-inline': inline }]">
      <slot />
    </div>
    <ol v-if="log" class="fdp-demo-log">
      <li v-if="!lines.length" class="fdp-demo-log-empty">Events appear here.</li>
      <li v-for="(line, index) in lines" :key="index">{{ line }}</li>
    </ol>
  </div>
</template>

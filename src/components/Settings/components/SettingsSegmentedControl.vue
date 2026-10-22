<script setup lang="ts" generic="T extends string">
import LiquidSegmentIndicator from '~/components/LiquidSegmentIndicator.vue'
import { settings } from '~/logic'

const props = defineProps<{
  modelValue: T
  options: readonly { label: string, value: T }[]
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
  'change': [value: T]
}>()

const groupRef = ref<HTMLElement>()
const hasSelectedOption = computed(() => props.options.some(option => option.value === props.modelValue))

function getOptionTabIndex(index: number) {
  if (props.options[index]?.value === props.modelValue)
    return 0
  return !hasSelectedOption.value && index === 0 ? 0 : -1
}

function selectOption(value: T) {
  emit('update:modelValue', value)
  emit('change', value)
}

function handleKeydown(event: KeyboardEvent) {
  const isNext = event.key === 'ArrowDown' || event.key === 'ArrowRight'
  const isPrevious = event.key === 'ArrowUp' || event.key === 'ArrowLeft'
  const isFirst = event.key === 'Home'
  const isLast = event.key === 'End'
  if (!isNext && !isPrevious && !isFirst && !isLast)
    return

  event.preventDefault()
  event.stopPropagation()

  const optionCount = props.options.length
  if (optionCount === 0)
    return

  const currentIndex = props.options.findIndex(option => option.value === props.modelValue)
  const lastIndex = optionCount - 1
  const nextIndex = isFirst
    ? 0
    : isLast
      ? lastIndex
      : isNext
        ? currentIndex < 0 ? 0 : (currentIndex + 1) % optionCount
        : currentIndex < 0 ? lastIndex : (currentIndex - 1 + optionCount) % optionCount
  const nextOption = props.options[nextIndex]
  if (!nextOption)
    return

  selectOption(nextOption.value)
  void nextTick(() => {
    groupRef.value
      ?.querySelectorAll<HTMLButtonElement>('[data-segment-value]')[nextIndex]
      ?.focus({ preventScroll: true })
  })
}
</script>

<template>
  <div
    ref="groupRef"
    class="settings-segmented-control bew-segment-control bew-segment-control--surface bew-segment-control--solid"
    :class="{ 'bew-segment-control--static': !settings.enableLiquidSegmentIndicator }"
    role="radiogroup"
    :aria-label="label"
    :style="{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }"
    @keydown="handleKeydown"
  >
    <LiquidSegmentIndicator
      v-if="settings.enableLiquidSegmentIndicator"
      :active-key="modelValue"
    />

    <button
      v-for="(option, index) in options"
      :key="option.value"
      type="button"
      class="settings-segmented-control__option bew-segment-control__item"
      :class="{ 'is-selected': modelValue === option.value }"
      data-segment-item
      :data-segment-value="option.value"
      :data-active="modelValue === option.value ? 'true' : undefined"
      :tabindex="getOptionTabIndex(index)"
      role="radio"
      :aria-checked="modelValue === option.value"
      @click="selectOption(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.settings-segmented-control {
  display: grid;
  width: 300px;
  max-width: 100%;
}

.settings-segmented-control__option {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

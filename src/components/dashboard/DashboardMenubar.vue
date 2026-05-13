<script setup lang="ts">
import { Languages, LayoutPanelLeft, Moon, RefreshCw } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger
} from "@/components/ui/menubar";
import {
  preferenceState,
  setLayoutMode,
  setLocale,
  setThemeMode,
  type LayoutMode,
  type LocaleCode,
  type ThemeMode
} from "@/state/preferenceStore";
import { Spinner } from "@/components/ui/spinner";

defineProps<{
  connectionPending: boolean;
}>();

const emit = defineEmits<{
  reconnect: [];
}>();

const { t } = useI18n();

function updateLocale(value: unknown): void {
  if (value === "zh-CN" || value === "en-US") {
    setLocale(value as LocaleCode);
  }
}

function updateTheme(value: unknown): void {
  if (value === "system" || value === "time" || value === "light" || value === "dark") {
    setThemeMode(value as ThemeMode);
  }
}

function updateLayout(value: unknown): void {
  if (value === "standard" || value === "sidebar-07") {
    setLayoutMode(value as LayoutMode);
  }
}
</script>

<template>
  <Menubar aria-label="dashboard menu">
    <MenubarMenu>
      <MenubarTrigger>
        <Languages class="mr-2 h-4 w-4" aria-hidden="true" />
        {{ t("menu.language") }}
      </MenubarTrigger>
      <MenubarContent>
        <MenubarLabel>{{ t("menu.language") }}</MenubarLabel>
        <MenubarRadioGroup :model-value="preferenceState.locale" @update:model-value="updateLocale">
          <MenubarRadioItem value="zh-CN">{{ t("language.zh") }}</MenubarRadioItem>
          <MenubarRadioItem value="en-US">{{ t("language.en") }}</MenubarRadioItem>
        </MenubarRadioGroup>
      </MenubarContent>
    </MenubarMenu>

    <MenubarMenu>
      <MenubarTrigger>
        <Moon class="mr-2 h-4 w-4" aria-hidden="true" />
        {{ t("menu.theme") }}
      </MenubarTrigger>
      <MenubarContent>
        <MenubarLabel>{{ t("menu.theme") }}</MenubarLabel>
        <MenubarRadioGroup :model-value="preferenceState.themeMode" @update:model-value="updateTheme">
          <MenubarRadioItem value="system">{{ t("theme.system") }}</MenubarRadioItem>
          <MenubarRadioItem value="time">{{ t("theme.time") }}</MenubarRadioItem>
          <MenubarRadioItem value="light">{{ t("theme.light") }}</MenubarRadioItem>
          <MenubarRadioItem value="dark">{{ t("theme.dark") }}</MenubarRadioItem>
        </MenubarRadioGroup>
      </MenubarContent>
    </MenubarMenu>

    <MenubarMenu>
      <MenubarTrigger>
        <LayoutPanelLeft class="mr-2 h-4 w-4" aria-hidden="true" />
        {{ t("menu.layout") }}
      </MenubarTrigger>
      <MenubarContent>
        <MenubarLabel>{{ t("menu.layout") }}</MenubarLabel>
        <MenubarRadioGroup :model-value="preferenceState.layoutMode" @update:model-value="updateLayout">
          <MenubarRadioItem value="standard">{{ t("layout.standard") }}</MenubarRadioItem>
          <MenubarRadioItem value="sidebar-07">{{ t("layout.sidebar07") }}</MenubarRadioItem>
        </MenubarRadioGroup>
      </MenubarContent>
    </MenubarMenu>

    <MenubarMenu>
      <MenubarTrigger>{{ t("menu.actions") }}</MenubarTrigger>
      <MenubarContent>
        <MenubarItem :disabled="connectionPending" @select="emit('reconnect')">
          <Spinner v-if="connectionPending" class="mr-2" aria-hidden="true" />
          <RefreshCw v-else class="mr-2 h-4 w-4" aria-hidden="true" />
          {{ t("menu.reconnect") }}
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
</template>

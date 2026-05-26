import { onMounted, ref } from "vue";

export function useSecretStorageHint() {
  const hint = ref(
    "API 密钥加密保存在本地，不会以明文写入配置文件。",
  );

  onMounted(() => {
    void window.colorTxt.secrets
      .isEncryptionAvailable()
      .then((r) => {
        if (r.available) {
          hint.value =
            "API 密钥由系统钥匙串/凭据管理器加密保存，不会以明文写入配置文件。";
        } else {
          hint.value =
            "当前环境无法使用系统钥匙串，API 密钥将以应用绑定方式加密保存。";
        }
      })
      .catch(() => {
        /* keep default */
      });
  });

  return { secretStorageHint: hint };
}

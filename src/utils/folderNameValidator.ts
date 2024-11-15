import i18n from '@/i18n'

export function folderNameValidator(val: string) {
  if (val.includes('/')) return i18n.global.t('files.toasts.illegal-character-in-foldername', {sign: '/'})
}

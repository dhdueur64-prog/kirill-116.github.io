/**
 * WorkTools — настройки обратной связи
 *
 * Чтобы получать сообщения с сайта:
 * 1. Зарегистрируйтесь на https://formspree.io (бесплатно)
 * 2. Создайте форму и вставьте URL вида https://formspree.io/f/xxxxxxxx
 * 3. Укажите его в endpoint ниже
 *
 * Без endpoint используется mailto (если задан feedbackEmail).
 */
window.WORKTOOLS_CONFIG = {
  // Formspree / webhook для формы обратной связи
  endpoint: '',

  // Запасной email (mailto), если endpoint пустой
  feedbackEmail: '',
};

/**
 * WorkTools — настройки обратной связи
 *
 * Чтобы получать сообщения через Formspree (без открытия почтового клиента):
 * 1. Зарегистрируйтесь на https://formspree.io (бесплатно)
 * 2. Создайте форму и вставьте URL вида https://formspree.io/f/xxxxxxxx
 * 3. Укажите его в endpoint ниже
 *
 * Сейчас используется mailto на feedbackEmail.
 */
window.WORKTOOLS_CONFIG = {
  // Formspree / webhook (если пусто — mailto)
  endpoint: '',

  // Email для обратной связи
  feedbackEmail: 'Kirill-116@yandex.ru',
};

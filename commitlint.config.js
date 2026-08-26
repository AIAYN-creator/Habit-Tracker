export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // El scope es el id de la tarjeta de Histos; se valida el formato, no la lista.
    'scope-empty': [1, 'never'],
  },
};

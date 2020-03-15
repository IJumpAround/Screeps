
function define (name: string, value: any) {
  Object.defineProperty(global.consts, name, {
    value: value,
    writable: false,
    enumerable: true,
    configurable: true
  });
}

global.consts = {}
define('MY_ROLE_MOVER', 'Mover');


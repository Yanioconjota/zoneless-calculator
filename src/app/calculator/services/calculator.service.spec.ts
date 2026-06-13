import { TestBed } from '@angular/core/testing';
import { CalculatorService } from './calculator.service';

describe('CalculatorService', () => {
  let service: CalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CalculatorService]
    });
    service = TestBed.inject(CalculatorService);
  });

  it('it should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be created with default values', () => {
    expect(service.resultText()).toBe('0');
    expect(service.subResultText()).toBe('0');
    expect(service.lastOperator()).toBe('+');
  });

  it('should set resultText, subResultText to "0" when C is pressed', () => {
    // Patrón AAA (Arrange, Act, Assert) — estructura recomendada para tests legibles.

    // Arrange: preparamos el estado inicial que queremos testear.
    // Las signals son públicas, por lo que podemos setearlas directamente
    // sin necesidad de simular interacciones previas del usuario.
    service.resultText.set('123');
    service.subResultText.set('456');
    service.lastOperator.set('-');

    // Act: ejecutamos la acción que queremos probar.
    service.constructNumber('C');

    // Assert: verificamos que el estado resultante sea el esperado.
    expect(service.resultText()).toBe('0');
    expect(service.subResultText()).toBe('0');
    expect(service.lastOperator()).toBe('+');
  });

  it('should update resultText with number input', () => {
    // Arrange: el servicio ya arranca con resultText = '0' (estado por defecto del beforeEach).

    // Act: ingresamos dos dígitos consecutivos.
    service.constructNumber('1');
    service.constructNumber('2');

    // Assert: constructNumber concatena los dígitos en resultText.
    // El '0' inicial se reemplaza con el primer dígito, y los siguientes se acumulan.
    expect(service.resultText()).toBe('12');
  });

  it('should handle operators correctly', () => {
    const operators = ['+', '-', '*', '/'];

    // Usamos forEach para probar el mismo comportamiento con cada operador
    // sin duplicar el test cuatro veces. Cada iteración es un AAA completo.
    operators.forEach(operator => {
      // Arrange: establecemos un número en pantalla.
      service.resultText.set('12345');

      // Act: ingresamos un operador.
      service.constructNumber(operator);

      // Assert: al presionar un operador, el servicio debe:
      // 1. Guardar el operador seleccionado en lastOperator.
      expect(service.lastOperator()).toBe(operator);
      // 2. Mover el número actual a subResultText (operando izquierdo).
      expect(service.subResultText()).toBe('12345');
      // 3. Resetear resultText a '0' listo para el segundo operando.
      expect(service.resultText()).toBe('0');
    });
  });

  it('should calculate result correctly for addition', () => {
    // Arrange: simulamos la secuencia de entrada "1 + 2 ="
    // usando constructNumber tal como lo haría el usuario al presionar botones.
    // Esto prueba que el flujo completo (entrada → operador → cálculo) funciona.
    service.constructNumber('1');
    service.constructNumber('+');
    service.constructNumber('2');

    // Act: '=' dispara calculateResult()
    service.constructNumber('=');

    // Assert
    expect(service.resultText()).toBe('3');
  });

  it('should calculate result correctly for subtraction', () => {
    // Arrange
    service.constructNumber('1');
    service.constructNumber('-');
    service.constructNumber('2');

    // Act: '=' dispara calculateResult()
    service.constructNumber('=');

    // Assert
    expect(service.resultText()).toBe('-1');
  });

  it('should calculate result correctly for multiplication', () => {
    // Arrange
    service.constructNumber('1');
    service.constructNumber('*');
    service.constructNumber('2');

    // Act: '=' dispara calculateResult()
    service.constructNumber('=');

    // Assert
    expect(service.resultText()).toBe('2');
  });

  it('should calculate result correctly for division', () => {
    // Arrange: ingresamos "10 / 2"
    service.constructNumber('1');
    service.constructNumber('0');
    service.constructNumber('/');
    service.constructNumber('2');

    // Act: '=' dispara calculateResult()
    service.constructNumber('=');

    // Assert
    expect(service.resultText()).toBe('5');
  });

  it('should handle decimal point correctly', () => {
    // Arrange: construimos el número 0.5
    service.constructNumber('0');
    service.constructNumber('.');
    service.constructNumber('.'); // segundo punto — debe ser ignorado (validación de doble punto)
    service.constructNumber('5');

    // Act: '=' con subResultText='0' y operador='+' → 0 + 0.5 = 0.5
    // El resultado queda en resultText y el estado queda listo para el siguiente número.
    service.constructNumber('=');
    expect(service.resultText()).toBe('0.5');

    // Continuamos escribiendo sobre el resultado: '0.5' ya tiene punto,
    // los puntos adicionales se ignoran y solo el dígito se concatena.
    service.constructNumber('.');
    service.constructNumber('.');
    service.constructNumber('3');
    expect(service.resultText()).toBe('0.53');
  });

  it('should handle decimal point starting with 0', () => {
    // Act: presionar '.' directamente desde '0' debe establecer '0.'
    service.constructNumber('.');
    service.constructNumber('.'); // segundo punto — ignorado
    expect(service.resultText()).toBe('0.');

    // Continuamos: '5' se concatena → '0.5', los puntos extras se ignoran.
    service.constructNumber('5');
    service.constructNumber('.');
    service.constructNumber('.');

    // Act: '=' con subResultText='0' y operador='+' → 0 + 0.5 = 0.5
    service.constructNumber('=');
    expect(service.resultText()).toBe('0.5');
  });

  it('should handle sign change +/-', () => {
    // Arrange: tenemos el número 5 en pantalla.
    service.constructNumber('5');

    // Act + Assert: primer +/- añade el signo negativo.
    service.constructNumber('+/-');
    expect(service.resultText()).toBe('-5');

    // Act + Assert: segundo +/- quita el signo negativo.
    service.constructNumber('+/-');
    expect(service.resultText()).toBe('5');
  });

  it('should handle backspace', () => {
    // Arrange: ingresamos "12" para tener un número con más de un dígito.
    service.constructNumber('1');
    service.constructNumber('2');

    // Act: presionamos Backspace.
    service.constructNumber('Backspace');

    // Assert: el último dígito ('2') fue eliminado.
    expect(service.resultText()).toBe('1');
  });

  it('should handle backspace with negative numbers', () => {
    // Arrange: establecemos "-12" directamente con signal y +/-.
    service.resultText.set('12');
    service.constructNumber('+/-'); // resultText = '-12'

    // Act: presionamos Backspace.
    service.constructNumber('Backspace');

    // Assert: el último dígito ('2') fue eliminado, preservando el signo.
    expect(service.resultText()).toBe('-1');
  });

  it('should handle max length', () => {
    // Arrange: el display ya está lleno (10 dígitos, el máximo permitido).
    service.resultText.set('1234567890');

    // Act: intentamos agregar un dígito más.
    service.constructNumber('1');

    // Assert: resultText no cambia — el límite de 10 caracteres se respeta.
    expect(service.resultText()).toBe('1234567890');
  });

  it('should handle invalid input', () => {
    // Arrange: estado inicial con resultText = '0'.

    // Act: ingresamos un carácter que no es número, operador ni especial.
    service.constructNumber('a');

    // Assert: resultText no cambia — el input inválido es ignorado silenciosamente.
    expect(service.resultText()).toBe('0');
  });

  it('should handle negative zero input correctly', () => {
    // Arrange: '0' es el estado inicial.
    service.constructNumber('0');

    // Act: intentamos poner el cero en negativo.
    service.constructNumber('+/-'); // resultText = '-0'

    // Act: '=' con subResultText='0', operador='+', resultText='-0'
    // parseFloat('-0') === 0 en JS → 0 + 0 = 0
    service.constructNumber('=');

    // Assert: operar con -0 produce 0 (comportamiento de parseFloat en JS).
    expect(service.resultText()).toBe('0');
  });
});

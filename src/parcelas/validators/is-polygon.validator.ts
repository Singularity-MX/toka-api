import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

/**
 * Valida que el valor sea un GeoJSON Polygon válido:
 * - type === "Polygon"
 * - coordinates es un array de anillos (arrays de [lng, lat])
 * - cada anillo tiene al menos 4 puntos (mínimo para cerrar el polígono)
 * - cada punto tiene 2+ números
 * - primer punto === último punto (anillo cerrado)
 */
@ValidatorConstraint({ name: 'IsPolygon', async: false })
export class IsPolygonConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!value || typeof value !== 'object') return false
    if (value.type !== 'Polygon') return false

    const rings = value.coordinates
    if (!Array.isArray(rings) || rings.length === 0) return false

    for (const ring of rings) {
      if (!Array.isArray(ring) || ring.length < 4) return false
      for (const point of ring) {
        if (!Array.isArray(point) || point.length < 2) return false
        if (typeof point[0] !== 'number' || typeof point[1] !== 'number') {
          return false
        }
      }
      // anillo cerrado: primer === último
      const first = ring[0]
      const last = ring[ring.length - 1]
      if (first[0] !== last[0] || first[1] !== last[1]) return false
    }

    return true
  }

  defaultMessage(): string {
    return 'polygon debe ser un GeoJSON Polygon válido (type="Polygon", anillos cerrados con ≥4 puntos [lng, lat])'
  }
}

export function IsPolygon(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPolygonConstraint,
    })
  }
}
export default class CustomMath
{
    // conversion d'angle Degrès -> radians
    static degToRad(degValue){
        return degValue * (Math.PI / 180);
    }

      // conversion d'angle Radian -> degrés
    static radToDeg(radValue){
        return radValue * (180 / Math.PI);
    }

    // normalisation d'un angle 
    static normalizeAngle(value, isRadian = false){
        const fullCircle = isRadian ? 2 * Math.PI : 360

        value %= 360;

        if(value >= 0) return value;

        value += fullCircle;

        return value;

    }
}
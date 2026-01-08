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
}
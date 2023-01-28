// Aqui serve para importar a logo em SVG
// Pois o react não reconhece o arquivos SVG

declare module "*.svg" {
    import React from 'react';
    import { SvgProps } from "react-native-svg";
    const content: React.FC<SvgProps>;
    export default content;
}
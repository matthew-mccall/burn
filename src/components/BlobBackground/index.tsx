'use client'

import {HTMLProps, useMemo} from "react";
import style from "./style.module.css"

interface ColorScheme {
    scheme: 'Complementary' | 'Analogous' | 'Triadic' | 'Split Complementary' | 'Tetradic';
    hues?: number[];
}

const potentialColorSchemes: ColorScheme[] = [{scheme: 'Complementary'}, {scheme: 'Analogous'}, {scheme: 'Triadic'}, {scheme: 'Split Complementary'}, {scheme: 'Tetradic'},];

export default function BlobBackground({children, className, blobCount = 5}: {
    blobCount?: number
} & HTMLProps<HTMLDivElement>) {
    const memoizedSampledHues = useMemo(() => {
        const colorScheme = potentialColorSchemes[Math.floor(Math.random() * potentialColorSchemes.length)];

        // generate array of colors based on color scheme
        const baseHue = Math.random() * 360;

        switch (colorScheme.scheme) {
            case 'Complementary':
                colorScheme.hues = [baseHue, baseHue + 180];
                break;
            case 'Analogous':
                colorScheme.hues = [baseHue, baseHue + 30, baseHue + 60];
                break;
            case 'Triadic':
                colorScheme.hues = [baseHue, baseHue + 120, baseHue + 240];
                break;
            case 'Split Complementary':
                colorScheme.hues = [baseHue, baseHue + 150, baseHue + 210];
                break;
            case 'Tetradic':
                colorScheme.hues = [baseHue, baseHue + 90, baseHue + 180, baseHue + 270];
                break;
        }

        const sampledHues = [];
        for (let i = 0; i < blobCount; i++) {
            sampledHues.push(colorScheme.hues[Math.floor(Math.random() * colorScheme.hues.length)]);
        }
        return sampledHues;
    }, [blobCount]);

    return (<div className={"position-relative"}>
            <div className={`position-absolute z-n1 h-100 w-100 ${className} top-0`}
                 style={{backgroundColor: `hsl(${memoizedSampledHues[0]}, 50%, 10%)`}}>
                <svg style={{
                    filter: "blur(72px)",
                }} className={`w-100 h-100 ${style.fadeIn}`}>
                    {memoizedSampledHues.map((hue, i) => {
                        return (<circle key={i} cx={`${Math.random() * 100}%`} cy={`${Math.random() * 100}%`}
                                        r={`${Math.random() * 100 + 72}`}
                                        fill={`hsla(${hue}, 100%, 50%, 75%)`}/>)
                    })}
                </svg>
            </div>
            {children}
        </div>)
}
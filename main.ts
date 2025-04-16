
namespace ShadeKind {

    let id: number;

    export function create() {
        if (!id) id = 0
        return id++
    }

    //% isKind
    export const Dark100 = create()
    
    //% isKind 
    export const Dark75 = create()

    //% isKind
    export const Dark50 = create()

    //% isKind
    export const Dark25 = create()

    //% isKind
    export const Light100 = create()

    //% isKind 
    export const Light75 = create()

    //% isKind
    export const Light50 = create()

    //% isKind
    export const Light25 = create()
}

namespace SpriteKind {
    //% isKind
    export const Shader = SpriteKind.create();
}

//% block="Shader Object" color="#9e6eb8" icon="\uf0eb"
namespace ShaderObj {

    let shadeData: number[][] = [
        // dark 100%
        [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
        // dark 75%
        [15,12,15,15,15,12,15,12,15,12,15,15,15,15,15,15],
        // dark 50%
        [15,11,12,12,12,14,12,8,15,8,12,15,15,12,15,15],
        // dark 25%
        [15,13,10,11,14,4,8,6,12,6,11,12,15,11,12,15],
        // light 100%
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        // light 75%
        [13,1,5,1,1,1,1,1,1,1,1,1,13,1,1,13],
        // light 50%
        [11,1,3,1,5,1,9,1,9,1,5,13,3,1,5,11],
        // light 25%
        [12,1,4,5,3,1,7,9,6,1,3,3,11,1,4,12]
    ]

    function newNumArr(len: number) {
        let uarrn: number[] = []
        for (let addidx = 0;addidx < len;addidx++) uarrn.push(0)
        return uarrn
    }

    function checkNewShade(id: number) {
        if (shadeData[id] || (id >= shadeData.length || id < 0)) return id
        shadeData.push(newNumArr(16))
        return shadeData.length-1
    }

    let screenRowsBuffer: Image;
    let maskRowsBuffer: Image;

    function shadeImage(target: Image, left: number, top: number, mask: Image, palette: number[]) {
        if (!screenRowsBuffer || screenRowsBuffer.height < target.height) {
            screenRowsBuffer = image.create(1,target.height);
        }
        if (!maskRowsBuffer || maskRowsBuffer.height < target.height) {
            maskRowsBuffer = image.create(1,mask.height);
        }

        let targetX = left | 0;
        let targetY = top | 0;
        let y: number;
        let x: number;

        for (x = 0; x < mask.width; x++, targetX++) {
            if (targetX >= target.width) break;
            else if (targetX < 0) continue;

            maskRowsBuffer.blitRow(0,0,mask,x,mask.height)
            screenRowsBuffer.blitRow(0,0,target,targetX,target.height);

            for (y = 0, targetY = top | 0; y < mask.height; y++, targetY++) {
                if (targetY >= target.height) break;
                else if (targetY < 0) continue;

                if (maskRowsBuffer.getPixel(0,y)) screenRowsBuffer.setPixel(0,targetY,palette[screenRowsBuffer.getPixel(0,targetY)]);
            }
            target.drawImage(screenRowsBuffer,targetX,0)
        }
    }

    function shadeitem(shadeIndex: number): number[] {
        return shadeData[shadeIndex]
    }

    //% blockId=shader_obj_setpalletecolor
    //% block="set $shadeID=shader_obj_kind_get in $palidx=colorindexpicker to $colidx=colorindexpicker"
    //% weight=100
    export function setShadePattern(shadeID: number, palidx: number, colidx: number) {
        shadeID = checkNewShade(shadeID)
        let pallete = shadeData[shadeID]
        pallete[palidx] = colidx
        shadeData[shadeID] = pallete
    }

    //% blockId=shader_obj_setpalletecolorlist
    //% block="set $shadeID=shader_obj_kind_get in $palidx to $colidx"
    //% palidx.shadow=lists_create_with palidx.defl=colorindexpicker
    //% colidx.shadow=lists_create_with colidx.defl=colorindexpicker
    //% weight=99
    export function setShadePatternList(shadeID: number, palidx: number[], colidx: number[]) {
        shadeID = checkNewShade(shadeID)
        let pallete = shadeData[shadeID]
        for (let pali = 0;pali < palidx.length; pali++) {
            pallete[palidx[pali]] = colidx[pali]
        }
        shadeData[shadeID] = pallete
    }

    /**
     * create shader sprite as rectangle image.
     * @param width of ractangle image
     * @param height of ractangle image 
     * @param shade level as enum or number 
     */
    //% blockId=shader_obj_createRectangularShaderSprite
    //% block="create rectangular shader with width $width height $height shade $shadeLevel"
    //% shadeLevel.shadow=shader_obj_kind_get
    //% width.defl=16
    //% height.defl=16
    //% blockSetVariable=myShader
    //% weight=89
    export function createRectangularShaderSprite(width: number, height: number, shadeLevel: number): Sprite {
        const scene = game.currentScene();

        let palette: number[];

        palette = shadeitem(shadeLevel);
        const i = image.create(width, height);
        i.fill(3);

        const sprite = new ShaderSpriteBasic(i, palette)
        sprite.setKind(SpriteKind.Shader);
        scene.physicsEngine.addSprite(sprite);

        return sprite
    }

    /**
     * create shader sprite as your image.
     * @param image to render 
     * @param shade pattern as kind number
     */
    //% blockId=shader_obj_createImageShaderSprite
    //% block="create image shader with $image shade $shadeLevel"
    //% image.shadow=screen_image_picker
    //% shadeLevel.shadow=shader_obj_kind_get
    //% blockSetVariable=myShader
    //% weight=90
    export function createImageShaderSprite(image: Image, shadeLevel: number): Sprite {
        const scene = game.currentScene();

        let palette: number[];

        palette = shadeitem(shadeLevel);

        const sprite = new ShaderSpriteBasic(image, palette)
        sprite.setKind(SpriteKind.Shader);
        scene.physicsEngine.addSprite(sprite);
        sprite.shadeRectangle = false;

        return sprite
    }

    /**
     * setting shade level as enum or number for shader sprite.
     * @param current shader sprite not original sprite 
     * @param new shade pattern as kind number
     */
    //% blockId=shader_obj_setShadeLevel
    //% block=" $spr set shade level to $shadeLevel=shader_obj_kind_get"
    //% spr.shadow=variables_get spr.defl=myShader
    //% weight=70
    export function setShade(spr: Sprite, shadeLevel: number) {
        let palette: number[];
        palette = shadeitem(shadeLevel)
        spr.data["__palette__"] = palette as number[]
        if (spr instanceof ShaderSpriteBasic) {
            (spr as ShaderSpriteBasic).onPaletteChanged(); // Update palette when set
        } else {
            throw (`this sprite is not an shader sprite ${spr}`);
        }
    }

    /**
     * kind number block shadow for shade level 
     * but not used it.
     */
    //% blockHidden
    //% shim=KIND_GET
    //% kindMemberName=Shade
    //% blockId=shader_obj_kind_get
    //% block="$level"
    //% kindNamespace=ShadeKind
    //% kindPromptHint="enter your shade here"
    //% weight=50
    export function _shadeLevel(level: number): number {
        return level;
    }

    class ShaderSpriteBasic extends Sprite {
        protected shadePalette: number[];
        shadeRectangle: boolean;

        constructor(image: Image, shadePalette: number[]) {
            super(image);
            this.data["__palette__"] = shadePalette as number[]
            this.shadePalette = shadePalette;
            this.shadeRectangle = true;
            this.onPaletteChanged();
        }


        onPaletteChanged() {
            if (this.shadePalette !== this.data["__palette__"]) this.shadePalette = this.data["__palette__"] as number[];
        }

        __drawCore(camera: scene.Camera) {
            if (this.isOutOfScreen(camera)) return;

            const ox = (this.flags & sprites.Flag.RelativeToCamera) ? 0 : camera.drawOffsetX;
            const oy = (this.flags & sprites.Flag.RelativeToCamera) ? 0 : camera.drawOffsetY;

            const l = this.left - ox;
            const t = this.top - oy;

            if (this.shadeRectangle) {
                this.image.fill(3)
            }
            shadeImage(screen, l, t, this.image, this.shadePalette);

            if (this.flags & SpriteFlag.ShowPhysics) {
                const font = image.font5;
                const margin = 2;
                let tx = l;
                let ty = t + this.height + margin;
                screen.print(`${this.x >> 0},${this.y >> 0}`, tx, ty, 1, font);
                tx -= font.charWidth;
                if (this.vx || this.vy) {
                    ty += font.charHeight + margin;
                    screen.print(`v${this.vx >> 0},${this.vy >> 0}`, tx, ty, 1, font);
                }
                if (this.ax || this.ay) {
                    ty += font.charHeight + margin;
                    screen.print(`a${this.ax >> 0},${this.ay >> 0}`, tx, ty, 1, font);
                }
            }

            // debug info
            if (game.debug) {
                screen.drawRect(
                    Fx.toInt(this._hitbox.left) - ox,
                    Fx.toInt(this._hitbox.top) - oy,
                    Fx.toInt(this._hitbox.width),
                    Fx.toInt(this._hitbox.height),
                    1
                );
            }

        }
    }

}
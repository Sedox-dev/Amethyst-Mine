import { Vector2 } from '../math/vector2.js'

interface ITilemap {
  tiles: Tiles
  layers: Layers

  draw(folder: string, layerIndex: number, cameraOffset: Vector2, tileOffset: Vector2): void
  drawTile(path: string, position: Vector2, offset: Vector2): void
}

type TileProps = {
  offset: Vector2
}

type Grid = number[][]
type LayerProps = {
  grid: Grid
  texturePath: string
}

type Tiles = Record<string, Record<number, TileProps>>
type Layers = Record<string, Record<number, LayerProps>>

export class Tilemap implements ITilemap {
  public tiles: Tiles = {}
  public layers: Layers = {}

  private ctx: CanvasRenderingContext2D
  private tileSize: number
  private cache: Record<string, HTMLImageElement> = {}

  constructor(ctx: CanvasRenderingContext2D, tileSize: number) {
    this.ctx = ctx
    this.tileSize = tileSize
  }

  draw(folder: string, layerIndex: number, cameraOffset: Vector2, tileOffset = new Vector2()) {
    if (!this.layers[folder.toLowerCase()]) throw new Error(`Folder: ${folder} not found`)

    const layer: LayerProps = this.layers[folder.toLowerCase()][layerIndex]

    for (let x = 0; x < layer.grid.length; x++) {
      for (let y = 0; y < layer.grid[1].length; y++) {
        if (layer.grid[x][y] == 0) continue

        this.drawTile(
          layer.texturePath,
          new Vector2(
            Math.round(y * this.tileSize + tileOffset.x - cameraOffset.x),
            Math.round(x * this.tileSize + tileOffset.y - cameraOffset.y),
          ),
          this.tiles[folder.toLowerCase()][layer.grid[x][y]].offset,
        )
      }
    }
  }

  drawTile(path: string, position: Vector2, offset: Vector2) {
    const image = this.cache[path] || new Image()

    if (!image.src) {
      image.src = path

      this.cache[path] = image
    }

    this.ctx.drawImage(
      image,
      offset.x,
      offset.y,
      16,
      16,
      position.x,
      position.y,
      this.tileSize,
      this.tileSize,
    )
  }
}

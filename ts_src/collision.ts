import {vec2} from 'wgpu-matrix'
import { GameEntity, EntityType } from 'game_entity';
export {Rect, isColliding, moveAndHandleCollision }

class Rect
{
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;
}

function isColliding(a: Rect, b: Rect)
{
    return a.x < b.x + b.width && a.y < b.y + b.height && b.x < a.x + a.width && b.y < a.y + a.height;
}

function moveRect(r: Rect, time: number, v: Float32Array)
{
    r.x += v[0]*time;
    r.y += v[1]*time;
}

function moveAndHandleCollision(entity: GameEntity, b: Rect, time: number, av: Float32Array, bv: Float32Array = new Float32Array([0,0]))
{
    let a = entity.rect;

    let atemp = {x: a.x, y: a.y, width: a.width, height: a.height};
    let btemp = {x: b.x, y: b.y, width: b.width, height: b.height};

    moveRect(atemp, time, av);
    moveRect(btemp, time, bv);

    if (!isColliding(atemp, btemp))
    {
        moveRect(a, time, av);
        moveRect(b, time, bv);
        return;
    }

    let avRel: Float32Array = new Float32Array([av[0] - bv[0], av[1] - bv[1]]);

    // tx*v + (ax+aw) = bx
    let tx = time;
    let ty = time;

    if (avRel[0] > 0)
    {
        tx = (b.x - (a.x + a.width)) / avRel[0];
    }
    else if (avRel[0] < 0)
    {
        tx = ((b.x + b.width) - a.x) / avRel[0];
    }

    if (avRel[1] > 0)
    {
        ty = (b.y - (a.y + a.height)) / avRel[1];
    }
    else if (avRel[1] < 0)
    {
        ty = ((b.y + b.height) - a.y) / avRel[1];
    }

    ty = Math.max(Math.min(ty, time), 0);
    tx = Math.max(Math.min(tx, time), 0);

    let t = Math.min(ty, tx);

    moveRect(a, t, av);
    moveRect(b, t, bv);

    let len = vec2.len(av);
    if (av[1] != 0.0 && a.x >= b.x + b.width || a.x + a.width <= b.x)
    {
        av[0] = 0.0;
        //av[1] = len * Math.sign(av[1]);
        moveRect(a, time-t, av);
    }
    if (a.y >= b.y + b.height || a.y + a.height <= b.y)
    {
        //av[0] = len * Math.sign(av[0]);
        av[1] = 0.0;
        moveRect(a, time-t, av);
        entity.vy = 0;
    }
}

import React from 'react';
import Klint, { useKlint, useStorage } from '@shopify/klint';
import { FontParser, Delaunay, ParticleSystem } from '@shopify/klint-plugins';

/**
 * Simple Plugin System Example
 * 
 * Plugins are classes that we instantiate and extend the context with
 * using K.extend('name', instance)
 */
function SimplePluginExample() {
  const { context } = useKlint();
  const storage = useStorage({ 
    font: null,
    particles: null 
  });
  
  const preload = async (K) => {
    // Extend the context with plugin instances
    K.extend('FontParser', new FontParser(K));
    K.extend('Delaunay', new Delaunay(K));
    K.extend('ParticleSystem', new ParticleSystem(K));
    
    // Now plugins are available on K
    // Load a font and store it
    const font = await K.FontParser.load('myFont', '/assets/font.ttf');
    storage.set('font', font);
    
    // Setup particle system
    K.ParticleSystem.createEmitter({
      x: K.width / 2,
      y: K.height / 2,
      config: {
        emitRate: 10,
        lifespan: 2000,
        colors: ['#ff0066', '#00ff66', '#0066ff']
      }
    });
    
    console.log('Plugins loaded and initialized');
  };
  
  const setup = async (ctx) => {
    await preload(ctx);
    ctx.background('#111');
  };
  
  const draw = (ctx) => {
    ctx.background('#111', 0.05);
    
    // Use plugins via context
    if (ctx.ParticleSystem) {
      ctx.ParticleSystem.update(16);
      ctx.ParticleSystem.draw({ blendMode: 'lighter' });
    }
    
    if (ctx.Delaunay) {
      // Create random points
      const points = Array.from({ length: 20 }, () => ({
        x: Math.random() * ctx.width,
        y: Math.random() * ctx.height
      }));
      
      // Triangulate
      const triangles = ctx.Delaunay.triangulate(points);
      
      // Draw triangles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.Delaunay.draw(triangles, {
        fill: false,
        stroke: true
      });
    }
    
    if (ctx.FontParser && storage.get('font')) {
      // Draw text as points
      const text = 'KLINT';
      const points = ctx.FontParser.toPoints(text, 'myFont', 100);
      
      ctx.fillStyle = 'white';
      points.forEach((p, i) => {
        const size = Math.sin(ctx.time * 0.002 + i * 0.1) * 2 + 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };
  
  return (
    <Klint
      context={context}
      setup={setup}
      draw={draw}
      options={{
        dpr: 2,
        origin: 'corner'
      }}
    />
  );
}

/**
 * Example with type definitions for better IDE support
 */
import type { KlintContext } from '@shopify/klint';

// Extend KlintContext type to include plugins
interface ExtendedContext extends KlintContext {
  FontParser?: FontParser;
  Delaunay?: Delaunay;
  ParticleSystem?: ParticleSystem;
}

function TypedPluginExample() {
  const { context } = useKlint();
  
  const setup = async (ctx: ExtendedContext) => {
    // Extend with plugins
    ctx.extend('FontParser', new FontParser(ctx));
    ctx.extend('Delaunay', new Delaunay(ctx));
    
    // TypeScript now knows about the plugins
    if (ctx.FontParser) {
      await ctx.FontParser.load('font', '/font.ttf');
    }
    
    ctx.background('#000');
  };
  
  const draw = (ctx: ExtendedContext) => {
    ctx.background('#000', 0.1);
    
    // Use plugins with type safety
    if (ctx.Delaunay) {
      const points = [
        { x: 100, y: 100 },
        { x: 200, y: 150 },
        { x: 150, y: 250 }
      ];
      
      const triangles = ctx.Delaunay.triangulate(points);
      ctx.Delaunay.draw(triangles);
    }
  };
  
  return (
    <Klint
      context={context}
      setup={setup}
      draw={draw}
    />
  );
}

export { SimplePluginExample, TypedPluginExample };
fxfl
====

##A directive library for fixed / fluid layout in Angular.js

CSS is the essence of layout. Layout systems like [Bootstrap](http://getbootstrap.com/), [Foundation](http://foundation.zurb.com/), [PureCSS](http://purecss.io/), and [One%](http://onepcssgrid.mattimling.com/) are powerful toolkits for styling a page and saving development time. However there are times when layout frameworks don't succeed at your goals, and writing CSS from scratch may become problematic.

FxFl is a convenience library using Angular.js that allows the user to specify their layout in panels. The container can be placed inside a modal for quick layout positioning or the main container for the page in a desktop like application. The library uses one directive that nest to create more complex layouts.

##Features

1. Top down propagation of element refresh so that sizes stay accurate.
2. Values from Angular.js are cached so that resize will not cause digest cycle thrashing.
3. Specify percentage or absolute values and the container sets the values precisely regardless.

##Features Roadmap

1. Values will also be allowed to be class names settable through evaluation.

##Use Cases

###Fixed / Fluid Column Layout

Set up <divs> for a fixed fluid layout of 250px fixed, while the fluid column to be the remaining 100% of width.

    <div fxfl-pannel>
      <div fxfl-pannel fxfl-width="250"></div>
      <div fxfl-pannel fxfl-width="100%"></div>
    </div>


###3 Fixed two Fluid Column Layout

Set up <divs> for a fixed fluid layout of 250px fixed, while the fluid column to be the remaining 100% of width. Harder than the first with just CSS.

    <div fxfl-pannel>
      <div fxfl-pannel fxfl-width="200"></div>
      <div fxfl-pannel fxfl-width="60%"></div>
      <div fxfl-pannel fxfl-width="200"></div>
      <div fxfl-pannel fxfl-width="40%"></div>
      <div fxfl-pannel fxfl-width="200"></div>
    </div>
    
###Columns With Rows That Contain Fixed Headers

A fixed column with a fluid container next to it. The fluid column has two rows each with a 50px header with the portion below taking up 50% of the rest of the available space.

    <div fxfl-pannel>
      <div fxfl-pannel fxfl-width="200"></div>
      <div fxfl-pannel fxfl-width="100%">
        <div fxfl-pannel fxfl-height="50"></div>
        <div fxfl-pannel fxfl-height="50%"></div>
        <div fxfl-pannel fxfl-height="50"></div>
        <div fxfl-pannel fxfl-height="50%"></div>
      </div>
    </div>

##Anti Patterns

Coming Soon...





import { Scene } from './Control';
import { MControl, MScene, State } from './State';
import { Component, h, render } from 'preact';
import * as mixer from 'mixer';

/**
 * PreactScene is the base scene. You can extend and override this scene.
 */
@Scene({ default: true })
export class PreactScene<T> extends Component<{ scene: MScene }, T & mixer.IScene> {
    protected readonly scene: MScene;
    private sceneUpdateListener = (ev: mixer.IScene) => {
        this.setState(Object.assign({}, this.state, ev));
    };

    constructor(props: { scene: MScene }, attributes: T) {
        super(props, attributes);
        this.scene = props.scene;
    }

    /**
     * @override
     */
    public componentWillMount() {
        this.scene.on('update', this.sceneUpdateListener);
    }

    /**
     * @override
     */
    public componentWillUnmount() {
        this.scene.removeListener('update', this.sceneUpdateListener);
    }

    public render() {
        return <div class={`scene scene-${this.scene.sceneID}`}>
            {this.getAllControls()}
        </div>;
    }

    /**
     * Returns an array of all controls, that can be injected in render().
     */
    protected getAllControls() {
        return this.state.controls.map(this.getSceneComponent);
    }

    /**
     * Returns the renderable component for a control.
     */
    protected getSceneComponent(control: MControl) {
        const El = control.descriptor().ctor as typeof PreactControl;
        return <El control={control} />;
    }
}

/**
 * PreactStage is the bootstrap component for the interactive integration.
 * You may swap this out or customize it if you want, but it shouldn't
 * generally be necessary.
 */
export class PreactStage extends Component<any, { scene: MScene }> {
    private interactive = new State();

    constructor() {
        super();
        this.interactive.participant.on('groupUpdate', ev => {
            if (ev.sceneID !== this.state.scene.sceneID) {
                this.setState({ ...this.state, scene: this.interactive.scenes[ev.sceneID] });
            }
        });
    }

    public render() {
        return <div class="stage">{this.getSceneComponent(this.state.scene)}</div>;
    }


    /**
     * Returns the renderable component for the scene.
     */
    protected getSceneComponent(scene: MScene) {
        const El = scene.descriptor().ctor as typeof PreactScene;
        return <El scene={scene} />;
    }
}

/**
 * PreactControl is the "primitve" control that you can extend to implement
 * your own control types. Make sure to decorate your extensions with @Control
 * to register them! Check out our built-in Joystick and Button types for
 * some examples.
 */
export abstract class PreactControl<T> extends Component<{ control: MControl }, T & mixer.IControl> {
    protected readonly control: MControl;
    private controlUpdateListener = (ev: mixer.IScene) => {
        this.setState(Object.assign({}, this.state, ev));
    };

    constructor(props: { control: MControl }, attributes: T) {
        super();
        this.control = props.control;
    }

    /**
     * @override
     */
    public componentWillMount() {
        this.control.on('update', this.controlUpdateListener);
    }

    /**
     * @override
     */
    public componentWillUnmount() {
        this.control.removeListener('update', this.controlUpdateListener);
    }
}

/**
 * Helper to conditionally join classes together. For example, passing in
 * `{ pressed: true, disabled: false focused: true }`
 * would yield `pressed focused`.
 */
export function classes(cls: { [key: string]: boolean }): string {
    return Object.keys(cls)
        .filter(key => cls[key])
        .join(' ');
}
import { Component, h } from 'preact';
import * as Mixer from 'miix/std';

import { FixedGridLayout, FlexLayout } from './Layout';
import { MScene } from '../State';

function getLayoutEngine() {
    if (Mixer.packageConfig.display.mode === 'flex') {
        return FlexLayout;
    }

    return FixedGridLayout;
}

type SceneProps<S> = { resource: MScene<S & Mixer.IScene> } & S & Mixer.IScene;


/**
 * PreactScene is the base scene. You can extend and override this scene.
 */
@Mixer.Scene({ default: true })
export class PreactScene<T, S = {}> extends Component<SceneProps<S>, T> {
    protected scene: MScene<S & Mixer.IScene>;

    constructor(props: SceneProps<S>) {
        super(props);
        this.scene = props.resource;
    }

    /**
     * @override
     */
    public componentWillReceiveProps(nextProps: SceneProps<S>) {
        this.scene = nextProps.resource;
    }

    public render() {
        const Layout = getLayoutEngine();
        return (
            <div class={`scene scene-${this.scene.props.sceneID}`}>
                <Layout scene={this.scene} />
            </div>
        );
    }
}

declare interface Route {
    icon: any;
    href: string;
    label: string;
    options: {
        icon: any;
        href: string;
        label: string;
    }[];
    protected: boolean;
}

declare interface SmartContract {
    address: string;
    abi: any;
}

declare module 'lucide-react/dist/esm/icons/*' {
    import { LucideIcon } from 'lucide-react';
    const icon: LucideIcon;
    export default icon;
}

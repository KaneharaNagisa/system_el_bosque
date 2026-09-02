import { Link as InertiaLink, router, usePage } from "@inertiajs/react";
import type { ComponentProps, ReactNode } from "react";

type LinkProps = Omit<ComponentProps<typeof InertiaLink>, "href"> & {
    to: string;
    children?: ReactNode;
};

type NavigateOptions = {
    replace?: boolean;
    state?: unknown;
};

const NAVIGATION_STATE_KEY = "elbosque_navigation_state:";

function navigationStateKey(url: string) {
    return `${NAVIGATION_STATE_KEY}${new URL(url, window.location.origin).pathname}`;
}

export function Link({ to, children, ...props }: LinkProps) {
    return (
        <InertiaLink href={to} {...props}>
            {children}
        </InertiaLink>
    );
}

export function useNavigate() {
    return (to: string | number, options: NavigateOptions = {}) => {
        if (typeof to === "number") {
            window.history.go(to);
            return;
        }

        if (options.state !== undefined) {
            sessionStorage.setItem(
                navigationStateKey(to),
                JSON.stringify(options.state),
            );
        } else {
            sessionStorage.removeItem(navigationStateKey(to));
        }

        router.visit(to, { replace: options.replace });
    };
}

export function useLocation() {
    const { url } = usePage();
    const parsedUrl = new URL(url, window.location.origin);
    const storedState = sessionStorage.getItem(navigationStateKey(url));

    return {
        pathname: parsedUrl.pathname,
        search: parsedUrl.search,
        hash: parsedUrl.hash,
        state: storedState ? JSON.parse(storedState) : null,
    };
}

export function useSearchParams(): [URLSearchParams] {
    const { search } = useLocation();

    return [new URLSearchParams(search)];
}

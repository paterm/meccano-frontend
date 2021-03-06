import React from 'react';
import { isAccess } from "../../../helpers/Tools";
import { PERMISSION } from "../../../constants";
import { EventEmitter } from "../../../helpers";
import { EVENTS } from "../../../constants";
import { useSelector } from "react-redux";
import Loader from "../Loader/Loader";

export default function Access({ permissions, children, replaceComponent, redirect }) {
    const profile = useSelector(state => state.profile);

    if (_.isEmpty(profile)) {
        return <Loader/>;
    }

    const canRender = !permissions || permissions.includes(PERMISSION.all) || isAccess(permissions || [], profile);

    if (!canRender && redirect) {
        EventEmitter.emit(EVENTS.REDIRECT, redirect);
    }

    return canRender ? <>{children}</> : replaceComponent || null;
};

export class Permission {
    static ensureRole(role, type) {
        return async (req, res, next) => {
            try {
                if (type === "delete") {

                }
                if (type === "edit") {

                }
                if (type === "add") {

                }
                if (type === "view") {

                }
                return next();
            } catch (err) {
                return
            }
        }
    }
}
